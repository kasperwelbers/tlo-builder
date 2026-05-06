# TLO Builder

A tool for designing and aligning course learning objectives (CLOs), intended learning outcomes (ILOs), and trajectory learning outcomes (TLOs) across a curriculum.

Each project lives at a unique secret URL (like Google Docs) — no login required.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| Backend | Hono on Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) via Drizzle ORM |
| Real-time sync | Cloudflare Durable Objects + WebSockets |

## Local Development

### Prerequisites
- Node.js ≥ 20
- pnpm
- A [Cloudflare account](https://dash.cloudflare.com) (free tier is fine)

### 1 — Install dependencies

```bash
pnpm install
```

### 2 — Set up the local database

```bash
pnpm db:migrate
```

This applies the migrations in `./migrations/` to the local Wrangler D1 instance.

### 3 — Start the dev servers

```bash
pnpm dev
```

This runs two processes in parallel:
- **Wrangler** on port 8787 — handles `/ws/*` WebSocket connections
- **Vite** on port 5173 — serves the frontend and proxies API/WS calls to Wrangler

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Deploying to Cloudflare

### 1 — Log in to Cloudflare

```bash
pnpm wrangler login
```

### 2 — Create the D1 database

```bash
pnpm wrangler d1 create tlo-builder
```

Copy the `database_id` from the output and paste it into `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "tlo-builder"
database_id = "your-real-id-here"
```

### 3 — Apply migrations to production

```bash
pnpm db:migrate:remote
```

### 4 — Build and deploy

```bash
pnpm run deploy
```

This builds the frontend (`vite build`) and deploys the Worker + static assets to Cloudflare. Wrangler will print the live URL when done.

### Viewing logs

```bash
wrangler tail
```

Or go to the Cloudflare dashboard → Workers → your worker → **Logs**.

### Subsequent deploys

```bash
pnpm run deploy
```

If you've changed the database schema, run `pnpm db:migrate:remote` first.

### Custom domain

In the Cloudflare dashboard: **Workers & Pages → your worker → Settings → Domains & Routes**.

---

## Project Structure

```
src/               Cloudflare Worker (Hono API + Durable Objects)
  index.ts         Entry point and route definitions
  db/              Drizzle schema and client
  ws/              WebSocket handlers and ProjectRoom Durable Object
frontend/          React app (served by Vite in dev, built to ./dist)
  src/
    components/    UI components
    context/       React context (AppContext, HelpContext, NavigationContext)
    hooks/         useWebSocket
    lib/           Types, utilities, YAML import/export, CSV helpers
migrations/        SQL migration files applied by Wrangler
```

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start Vite + Wrangler dev servers |
| `pnpm build` | Build frontend to `./dist` |
| `pnpm run deploy` | Build and deploy to Cloudflare |
| `pnpm db:migrate` | Apply migrations locally |
| `pnpm db:migrate:remote` | Apply migrations to production D1 |
| `pnpm db:generate` | Regenerate migration files from schema |
