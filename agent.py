"""Generates a daily AI/tech news digest using Claude + web_search."""

from __future__ import annotations

import os
from datetime import datetime
from zoneinfo import ZoneInfo

import anthropic

MODEL = "claude-haiku-4-5"

# Structured as a list so cache_control can be applied — the system prompt is
# large and static, making it a good candidate for prompt caching.
SYSTEM_PROMPT = [
    {
        "type": "text",
        "text": (
            "You are an AI/tech news analyst. Search the web for today's most important "
            "AI and tech news and produce a skimmable Slack digest.\n\n"
            "Coverage (priority order): AI model releases & benchmarks • AGI/frontier "
            "research • Hot technical debates (X/HN/blogs) • AI infrastructure (NVIDIA, "
            "hyperscalers) • AI labs (OpenAI, Anthropic, Google, xAI, Meta, Mistral, "
            "DeepSeek) • Enterprise software (Slack, Salesforce, Microsoft, ServiceNow, "
            "Databricks, Snowflake).\n\n"
            "Format: Slack mrkdwn — *bold*, _italic_, <url|text> links, • bullets. "
            "No # headers.\n\n"
            "Structure:\n"
            "*📅 AI & Tech Daily — <date>*\n"
            "*🚀 Top story* — one paragraph + source link\n"
            "*🧠 Model releases* • bullet + source link\n"
            "*🔬 Frontier research* • ...\n"
            "*🔥 Hot debates* • what's argued + sides + source link\n"
            "*⚙️ Infrastructure* • ...\n"
            "*🏛️ AI labs* • ...\n"
            "*🏢 Enterprise* • ...\n"
            "*📌 Quick hits* • one-liners\n\n"
            "Rules: name companies/models/numbers/people. Every item needs a source link. "
            "400–600 words total. Omit empty sections. Prefer primary sources. No speculation."
        ),
        "cache_control": {"type": "ephemeral"},
    }
]


def _user_prompt(now: datetime) -> str:
    date_str = now.strftime("%A, %B %d, %Y")
    return (
        f"Produce the AI & tech briefing for {date_str}. "
        "Search the web for news from the last 24 hours. "
        "Output only the Slack mrkdwn digest — no preamble."
    )


def generate_digest(now: datetime | None = None) -> str:
    """Run the agent and return a Slack-mrkdwn-formatted digest."""
    tz = ZoneInfo(os.environ.get("TIMEZONE", "America/New_York"))
    now = now or datetime.now(tz)

    client = anthropic.Anthropic()

    user_message = {"role": "user", "content": _user_prompt(now)}
    messages = [user_message]

    tools = [
        {"type": "web_search_20260209", "name": "web_search", "max_uses": 6, "allowed_callers": ["direct"]},
        {"type": "web_fetch_20260209", "name": "web_fetch", "max_uses": 3, "allowed_callers": ["direct"]},
    ]

    # Server-side web_search may pause via stop_reason="pause_turn"; resend to resume.
    for _ in range(3):
        response = client.messages.create(
            model=MODEL,
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            tools=tools,
            messages=messages,
        )

        if response.stop_reason == "pause_turn":
            messages = [user_message, {"role": "assistant", "content": response.content}]
            continue

        text_parts = [b.text for b in response.content if b.type == "text"]
        return "\n".join(text_parts).strip()

    raise RuntimeError("Digest generation did not complete after 3 iterations")


def post_to_slack(digest: str) -> None:
    """Post a digest to the configured Slack channel."""
    from slack_sdk import WebClient

    client = WebClient(token=os.environ["SLACK_BOT_TOKEN"])
    channel = os.environ["SLACK_CHANNEL_ID"]
    text = f":newspaper: *Your daily AI & tech briefing*\n\n{digest}"
    client.chat_postMessage(
        channel=channel,
        text=text,
        unfurl_links=False,
        unfurl_media=False,
    )


if __name__ == "__main__":
    from dotenv import load_dotenv

    load_dotenv()
    digest = generate_digest()
    post_to_slack(digest)
    print("Digest posted to Slack.")
