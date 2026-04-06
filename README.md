# VReal Soft Fullstack Assessment

File storage service. Folders, files, permissions, share links, search.

Backend: NestJS + TypeORM. Frontend: Next.js 14 + Zustand + shadcn/ui. Database: PostgreSQL (local, via Docker). Storage: Local filesystem (Docker volume). Auth: Google OAuth + JWT (dev login available).

## Setup (Docker)

```bash
cp .env.example .env
docker compose up --build
```

Frontend: http://localhost:3000
Backend: http://localhost:4000
Swagger: http://localhost:4000/api/docs

PostgreSQL runs inside Docker — no external database needed. Uploaded files are stored locally in a Docker volume.

## Auth

Click "Continue as Dev User" on the login page — no Google credentials needed.

For Google OAuth, set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`. Get them from Google Cloud Console under APIs & Credentials > OAuth 2.0 Client ID.

## Environment Variables

See [.env.example](.env.example). No external services are required — everything runs locally via Docker.

## Tests

```bash
cd backend && npm test
cd frontend && npm test
```

## API Docs

All endpoints are documented in Swagger at http://localhost:4000/api/docs.

## License

MIT
