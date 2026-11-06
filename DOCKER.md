# Docker deployment

Material History uses **one `compose.yaml`** for database-free demo and PostgreSQL-backed operation.

## Demo (default; no database server)

```sh
docker compose up --build -d
```

Open http://localhost:3000. PostgreSQL is not started, and sample records are stored only in the browser.

## PostgreSQL mode

1. Copy `.env.example` to `.env`.
2. Set `NEXT_PUBLIC_DEMO_MODE=false`, a random `PAYLOAD_SECRET` (e.g. `openssl rand -hex 32`), and a strong `POSTGRES_PASSWORD`.
3. Start the app and its local database:

```sh
docker compose --profile postgres up --build -d
docker compose --profile postgres ps
```

The `postgres` profile enables the `db` service. It is not started for demo mode. PostgreSQL data is stored in a named `postgres-data` volume, not exposed on a host port. The app waits for a healthy database before starting and Payload applies checked-in production migrations.

## Switch back to demo

```sh
docker compose --profile postgres down
# Set NEXT_PUBLIC_DEMO_MODE=true in .env, then:
docker compose up --build -d
```

Switching requires **rebuilding** because Next.js embeds `NEXT_PUBLIC_DEMO_MODE` during compilation. Use `docker compose --profile postgres down` to stop the database service as well.

## External PostgreSQL

Set `NEXT_PUBLIC_DEMO_MODE=false`, `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` in `.env`. Run `docker compose up --build -d` **without** `--profile postgres`. The Compose connection string targets your external PostgreSQL host. Configure network permissions and provider-required TLS separately before exposing the app publicly.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_DEMO_MODE` | `true` | Use mock data instead of PostgreSQL |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Public URL; build-time setting |
| `PORT` | `3000` | Host port for app |
| `PAYLOAD_SECRET` | Demo placeholder | Required secure value for PostgreSQL mode |
| `POSTGRES_PASSWORD` | Demo placeholder | Required strong password for PostgreSQL mode |
| `POSTGRES_USER` | `material_history` | DB user |
| `POSTGRES_DB` | `material_history` | DB name |
| `POSTGRES_HOST` | `db` | PostgreSQL hostname |

The container start script rejects demo-only credentials in non-demo mode. Do not commit `.env`.

## Important

- Demo role switching is not authentication; the demo should not contain real data.
- Some approval/editing UI flows still need server-side persistence and authorization.
- Existing SQLite/Figma records are **not** automatically imported into PostgreSQL.
- Persistent uploaded media needs durable storage separately.
- Back up the PostgreSQL volume and review schema migrations before updating.
- `docker compose down` preserves volumes; `docker compose down -v` **deletes stored database data**.
