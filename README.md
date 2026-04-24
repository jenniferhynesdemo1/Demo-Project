# AI News Slack Agent

A Slack bot that posts a daily AI & tech news briefing to `#ai-news` at 8am and responds to `/ai-news` on demand.

## What it covers

- **Model performance & releases** — new models, benchmarks, capability jumps
- **AGI & frontier research** — papers, alignment, scaling results
- **Hot technical debates** — what AI researchers are arguing about right now
- **AI infrastructure** — NVIDIA, AMD, hyperscalers (AWS, Azure, GCP, Oracle)
- **AI labs** — OpenAI, Anthropic, Google, xAI, Meta, Mistral, DeepSeek
- **Enterprise software** — Slack, Salesforce, Microsoft, ServiceNow, Databricks, Snowflake

Under the hood: Claude Opus 4.7 with the `web_search` + `web_fetch` server-side tools. No separate news API needed.

## Setup

### 1. Python deps

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Create the Slack app

1. Go to <https://api.slack.com/apps> → *Create New App* → *From manifest*.
2. Pick the workspace.
3. Paste this manifest:

```yaml
display_information:
  name: AI News
  description: Daily AI & tech news briefing, on demand and on schedule
features:
  bot_user:
    display_name: AI News
    always_online: true
  slash_commands:
    - command: /ai-news
      description: Generate and post an AI & tech news digest to this channel
      usage_hint: just type /ai-news
      should_escape: false
oauth_config:
  scopes:
    bot:
      - chat:write
      - chat:write.public
      - commands
settings:
  interactivity:
    is_enabled: true
  org_deploy_enabled: false
  socket_mode_enabled: true
  token_rotation_enabled: false
```

4. *Install to Workspace* — copy the **Bot User OAuth Token** (`xoxb-...`) → `SLACK_BOT_TOKEN`.
5. *Basic Information* → *App-Level Tokens* → *Generate Token and Scopes* → add `connections:write` → create. Copy the `xapp-...` token → `SLACK_APP_TOKEN`.
6. Invite the bot to `#ai-news`: `/invite @AI News` in that channel.
7. Get the channel ID: right-click `#ai-news` → *View channel details* → copy the ID at the bottom (starts with `C`) → `SLACK_CHANNEL_ID`.

### 3. Anthropic key

Get one from <https://console.anthropic.com> → `ANTHROPIC_API_KEY`.

### 4. Configure

```bash
cp .env.example .env
# edit .env and fill in the four tokens/IDs
```

### 5. Run

```bash
python slack_app.py
```

The bot connects over Socket Mode (no public URL needed), starts the scheduler, and waits for `/ai-news` invocations. Leave it running — on a laptop, a small VM, or a container host (Fly.io, Render, Railway, an EC2 micro instance).

## Test

- In Slack: `/ai-news` in any channel the bot is in. It takes ~30–60 seconds.
- Daily post: fires at the hour/minute set in `.env` (default 8:00 `America/New_York`).

## Tuning

- **Different time / timezone:** change `DAILY_POST_HOUR`, `DAILY_POST_MINUTE`, `TIMEZONE` in `.env`. Any IANA zone works (`Europe/London`, `Asia/Singapore`, etc.).
- **Different coverage:** edit `SYSTEM_PROMPT` in `agent.py`. The prompt is where you tell Claude which companies, topics, and debates to prioritize.
- **Less chatty / more chatty:** adjust the word target at the end of `SYSTEM_PROMPT` (currently 400–700 words).
- **Second daily post:** add another `scheduler.add_job(...)` call in `slack_app.py` with a different `id` and `CronTrigger`.

## Cost

Each digest makes one call to Claude Opus 4.7 with web search/fetch. Expect a few cents per digest (search tool calls + input/output tokens). One scheduled post + occasional slash-command invocations is ~$1–3/month.

## Deployment

The bot is a single long-running process. Any of these work:

- **Fly.io**: `fly launch` — the included `requirements.txt` is enough; add a `Dockerfile` or use the Python buildpack.
- **Render / Railway**: deploy as a background worker running `python slack_app.py`.
- **Your own VM**: `systemd` unit or `tmux` session. Keep the `.env` file readable only by the service user.

No inbound port is needed — Socket Mode opens an outbound WebSocket to Slack.
