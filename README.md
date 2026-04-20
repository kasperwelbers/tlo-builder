# TLO Builder

A monorepo tool for mapping Learning Trajectory Outcomes (LTOs) and Intended Learning Outcomes (ITOs) to improve curriculum alignment.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS (v4)
- **Backend:** Hono, Node.js
- **Database:** SQLite via Drizzle ORM
- **Shared:** Zod for shared validation schemas

## Getting Started

1. Set up a SQLite database and provide the connection URL as `DATABASE_URL` in the environment if not using the default `sqlite.db`.

2. Push the schema to the database:
   ```bash
   cd apps/backend
   npm run db:push
   ```

3. Seed the database with some example data:
   ```bash
   npm run db:seed
   ```

4. Start the development server from the root of the project:
   ```bash
   npm run dev
   ```
