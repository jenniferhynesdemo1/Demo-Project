"""Generates a daily AI/tech news digest using Claude + web_search."""

from __future__ import annotations

import os
from datetime import datetime
from zoneinfo import ZoneInfo

import anthropic

MODEL = "claude-sonnet-4-6"

SYSTEM_PROMPT = """You are an AI and tech news analyst producing a daily briefing for a Slack channel.

Your job: search the web for the most important news from the last 24 hours across these areas, and synthesize a clear, skimmable digest.

## Coverage areas (in priority order)

1. **AI model performance & releases** — new model launches, benchmark results, capability jumps, evals. Name the specific model and what changed.
2. **AGI & frontier research** — research papers, lab announcements, safety/alignment work, scaling results, interpretability.
3. **Hot technical debates** — what AI researchers and engineers are arguing about right now on X/Twitter, blogs, and HackerNews. Scaling laws, architecture debates, open vs closed, RL vs pretraining, agents, evals critiques — surface the actual disagreement.
4. **AI infrastructure** — NVIDIA, AMD, custom silicon (Groq, Cerebras, TPU), hyperscalers (AWS, Azure, GCP, Oracle Cloud), data centers, power/energy constraints, networking.
5. **AI labs** — OpenAI, Anthropic, Google DeepMind, xAI, Meta AI, Mistral, DeepSeek, Qwen — product launches, research, leadership moves, funding, org changes.
6. **Enterprise software** — Slack, Salesforce especially. Also Microsoft, ServiceNow, Workday, Snowflake, Databricks, SAP, Oracle, Atlassian. Focus on AI-related product moves, integrations, and enterprise adoption.

## Output format (Slack mrkdwn)

Use Slack's mrkdwn syntax — NOT standard markdown:
- `*bold*` (single asterisks, not double)
- `_italic_`
- `<https://url|link text>` for links — always include a source link for each item
- `•` for bullets (not `-` or `*`)
- Use `>` for quotes
- No headers with `#`; use `*bold*` for section labels

Structure the digest like this:

*📅 AI & Tech Daily — <date>*

*🚀 Top story*
One paragraph on the single biggest story. <link|source>

*🧠 Model performance & releases*
• Item with specific details. <link|source>
• ...

*🔬 AGI & frontier research*
• ...

*🔥 Hot debates*
• What people are arguing about + who's on each side. <link|source>

*⚙️ AI infrastructure*
• ...

*🏛️ AI labs*
• ...

*🏢 Enterprise software (Slack, Salesforce, others)*
• ...

*📌 Quick hits*
• Short one-liners for minor news. <link|source>

## Rules

- Be specific and factual. Name companies, models, numbers, people.
- Skip filler items. If a section has nothing notable, omit it entirely.
- Every item needs a source link.
- Target 400–700 words total. Skimmable, not exhaustive.
- If a debate is happening on X/HN, quote a representative take and link it.
- Prefer primary sources (company blog, paper, announcement) over aggregators.
- No speculation. No "could", "might", "may" unless quoting someone.
"""


def _user_prompt(now: datetime) -> str:
    date_str = now.strftime("%A, %B %d, %Y")
    return (
        f"Produce the daily AI & tech briefing for {date_str}. "
        "Search the web for news from the last 24 hours. "
        "Focus on model performance, AGI/frontier research, hot technical debates, "
        "AI infrastructure (NVIDIA, hyperscalers), AI labs (OpenAI, Anthropic, "
        "Google, xAI, Meta, Mistral), and enterprise software (Slack, Salesforce, "
        "Microsoft, ServiceNow, Databricks, Snowflake). "
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
        {"type": "web_search_20260209", "name": "web_search", "max_uses": 15},
        {"type": "web_fetch_20260209", "name": "web_fetch", "max_uses": 10},
    ]

    # Server-side web_search loop may pause via stop_reason="pause_turn";
    # resend [user, latest_assistant] to resume. Cap iterations to avoid runaways.
    for _ in range(6):
        response = client.messages.create(
            model=MODEL,
            max_tokens=16000,
            system=SYSTEM_PROMPT,
            thinking={"type": "adaptive"},
            tools=tools,
            messages=messages,
        )

        if response.stop_reason == "pause_turn":
            messages = [user_message, {"role": "assistant", "content": response.content}]
            continue

        text_parts = [b.text for b in response.content if b.type == "text"]
        return "\n".join(text_parts).strip()

    raise RuntimeError("Digest generation did not complete after 6 iterations")


if __name__ == "__main__":
    from dotenv import load_dotenv

    load_dotenv()
    print(generate_digest())
