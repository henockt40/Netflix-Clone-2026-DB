# Netflix Clone 2026 — Original Design + db / services / Gemini

The original Netflix homepage, TMDB frontend browsing, movie cards, sliders, styles, assets, routes, authentication and browser-local My List remain in place. This version adds only a standalone **AI Picks** route and refactors the backend code into a **db/** and **services/** layout.

## Project structure

```text
Netflix-Clone-2026-DB-Services-Gemini/
├── backend/Netflix-2026-backend/
│   ├── db/                   # Moved from Schema/: db.js, schema.sql
│   ├── services/             # UserService, TmdbService, GeminiService, RecommendationService
│   ├── middleware/           # Auth, input validation, AI rate limits, errors
│   ├── controllers/          # UserC.js, AiC.js, existing MovieC.js
│   ├── Routes/               # UserRoutes.js, AiRoutes.js
│   ├── Auth/                 # Original helpers unchanged
│   ├── AllRoutes.js
│   ├── app.js
│   ├── .env.example
│   └── package.json
├── Netflix2026/
│   ├── src/Routing/Recommendations.jsx          # NEW AI Picks page
│   ├── src/Routing/Recommendations.module.css
│   └── ... all original frontend components and resources
├── docs/
└── references/
```

The former `Schema/` directory and `checkDb.js` file have been removed. The old `npm run db:check` script has also been removed; startup still checks the users table and refuses to start if MySQL is not ready.

## Local setup — Windows / Git Bash

1. Open `backend/Netflix-2026-backend/db/schema.sql` in MySQL Workbench, execute the schema (does not erase existing users).
2. Backend:
   ```bash
   cd backend/Netflix-2026-backend
   cp .env.example .env    # skip if your .env already exists; DO NOT overwrite secrets
   npm ci
   npm run dev
   ```
   Edit the local backend `.env`: MySQL credentials, `JWT_SECRET`, `CLIENT_ORIGIN`, `TMDB_API_KEY`, and optional `GEMINI_API_KEY`. `GEMINI_MODEL` defaults to `gemini-3.8-flash` and may be changed to a supported model available to your key.
3. Frontend, in another terminal from project root:
   ```bash
   cd Netflix2026
   cp .env.example .env
   npm ci
   npm run dev
   ```
   Keep `VITE_TMDB_API_KEY` in the frontend `.env` because the *original* browsing pages make TMDB calls directly. New AI requests use the backend `TMDB_API_KEY` and optional `GEMINI_API_KEY`.
4. Sign in, then choose **AI Picks** in the Netflix header (or visit `/discover`). Pick a mood and click **Recommend Movies**. Results link to the existing movie details and My List controls.

## API

- `GET /api/health` — health check
- `POST /api/auth/register` — register
- `POST /api/auth/login` — sign in
- `GET /api/auth/me` — authenticated profile
- `POST /api/ai/recommend` — authenticated, rate-limited movie recommendations

Example request after login:
```bash
curl -X POST http://localhost:3777/api/ai/recommend \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"mood":"funny","favorites":["The Matrix","Inception"]}'
```

## How recommendations work

The Express `RecommendationService` fetches real candidate movies from TMDB. If `GEMINI_API_KEY` is configured, Gemini ranks **only those supplied TMDB movie IDs**; the server verifies each selected ID against the returned candidates. If Gemini is missing or temporarily unavailable, genre/popularity-based TMDB titles remain available. This is not a streaming-movie feature; the existing pages continue to provide TMDB title details and trailers.

This version adds no database tables beyond your existing users schema. Saved movies remain browser-local in My List and their titles are submitted as optional preference hints to AI Picks. The backend API key is never returned to the frontend. Gemini API usage may incur fees depending on plan and quota.

The source ZIP intentionally excludes `.env` secrets, `node_modules`, and all standalone test directories and scripts. Middleware is used for runtime input validation, auth and rate limiting, not as a replacement for an automated test suite. No browser tests were performed.
