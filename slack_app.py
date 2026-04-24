"""Slack bot for the AI news agent.

Runs in Socket Mode (no public URL required) and exposes:
- /ai-news slash command: generate and post a digest on demand
- Scheduled daily post to SLACK_CHANNEL_ID at DAILY_POST_HOUR:DAILY_POST_MINUTE
"""

from __future__ import annotations

import logging
import os
from datetime import datetime
from zoneinfo import ZoneInfo

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from dotenv import load_dotenv
from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler

from agent import generate_digest

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("ai-news-bot")

app = App(token=os.environ["SLACK_BOT_TOKEN"])


def _post_digest(channel: str, header: str | None = None) -> None:
    """Generate a digest and post it to the given channel."""
    log.info("Generating digest for channel=%s", channel)
    digest = generate_digest()
    text = f"{header}\n\n{digest}" if header else digest
    app.client.chat_postMessage(
        channel=channel,
        text=text,
        unfurl_links=False,
        unfurl_media=False,
    )
    log.info("Posted digest to channel=%s (%d chars)", channel, len(text))


@app.command("/ai-news")
def handle_ai_news_command(ack, respond, command):
    """On-demand digest via slash command."""
    ack()
    user_id = command["user_id"]
    channel_id = command["channel_id"]
    respond(
        text=f"On it, <@{user_id}> — searching the web for the latest AI & tech news. "
        "This takes ~30–60 seconds.",
        response_type="ephemeral",
    )
    try:
        _post_digest(channel_id)
    except Exception:
        log.exception("Failed to generate digest")
        respond(
            text=":warning: Failed to generate digest. Check the server logs.",
            response_type="ephemeral",
        )


def _scheduled_job() -> None:
    channel = os.environ["SLACK_CHANNEL_ID"]
    try:
        _post_digest(channel, header=":newspaper: *Your daily AI & tech briefing*")
    except Exception:
        log.exception("Scheduled digest job failed")


def _start_scheduler() -> BackgroundScheduler:
    tz = ZoneInfo(os.environ.get("TIMEZONE", "America/New_York"))
    hour = int(os.environ.get("DAILY_POST_HOUR", "8"))
    minute = int(os.environ.get("DAILY_POST_MINUTE", "0"))

    scheduler = BackgroundScheduler(timezone=tz)
    scheduler.add_job(
        _scheduled_job,
        trigger=CronTrigger(hour=hour, minute=minute, timezone=tz),
        id="daily_ai_news_digest",
        name="Daily AI news digest",
        replace_existing=True,
        misfire_grace_time=3600,
    )
    scheduler.start()
    next_run = scheduler.get_job("daily_ai_news_digest").next_run_time
    log.info("Scheduler started. Daily post at %02d:%02d %s. Next run: %s", hour, minute, tz, next_run)
    return scheduler


def main() -> None:
    _start_scheduler()
    log.info("Starting Socket Mode handler. Today is %s.", datetime.now().date())
    handler = SocketModeHandler(app, os.environ["SLACK_APP_TOKEN"])
    handler.start()


if __name__ == "__main__":
    main()
