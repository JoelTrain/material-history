# Docker deployment

This repository supports a production-mode Next.js Docker image. **Docker Compose starts in database-free demo mode by default**, using sample records.

## Demo: no database setup

```bash
docker compose up --build -d
docker compose ps
```

Open **http://localhost:3000**. The demo does not require initializing SQLite. Demo changes live in the browser's `localStorage` and are not shared across devices or browsers.

Stop it with `docker compose down` (the named volume remains).

## Build and run an image without Compose

```bash
docker build --build-arg NEXT_PUBLIC_DEMO_MODE=true -t material-history:local .
docker run --rm -p 3000:3000 -e NEXT_PUBLIC_DEMO_MODE=true -e PAYLOAD_SECRET=demo-only-not-for-production material-history:local
```

## Enable a database-backed environment

1. Create `.env` with a strong randomly generated `PAYLOAD_SECRET` (run `openssl rand -hex 32`).
2. Set `NEXT_PUBLIC_DEMO_MODE=false` in `.env`.
3. Rebuild the image with `docker compose up --build -d`.

The Compose SQLite URL points to `file:/app/data/material-history.db`, stored in the named `material-history-data` volume. **This configuration provides persistent database files but does not initialize or migrate schema/data**, nor does it verify administrator login or upload persistence. The existing Payload CMS first-user process and schema initialization must be completed for actual database-backed use. Back up the volume before upgrades.

SQLite is intended for development or limited single-instance use. Use a managed database and a durable upload storage solution for multi-instance production deployment.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | Host port published by Compose |
| `NEXT_PUBLIC_DEMO_MODE` | `true` | Enable browser-based mock mode |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Public site URL used for metadata |
| `PAYLOAD_SECRET` | Insecure **demo-only** placeholder | Required, set a strong secret before real use |

`NEXT_PUBLIC_*` values are bundled during the image build. Changing either requires rebuilding the Docker image, not just restarting a container.

To build and launch:

```bash
docker compose config
docker compose up --build -d
docker compose logs -f app
```

Use `docker compose down` to stop. Do not use `docker compose down -v` unless you intend to **delete the persistent SQLite volume**.

The frontend demo can run without a database, but **Payload /admin and /api routes still require the real database**. Demo role switching is not real authentication. Do not expose a demo deployment as a production system with real information.
