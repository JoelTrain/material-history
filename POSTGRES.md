# PostgreSQL and demo modes

Material History supports two separate modes:

| Mode | Setting | Persistence | Authentication |
| --- | --- | --- | --- |
| **Frontend demo** | `NEXT_PUBLIC_DEMO_MODE=true` | Sample records and browser localStorage | Simulated role picker; not authentication |
| **PostgreSQL-backed** | `NEXT_PUBLIC_DEMO_MODE=false` | Payload CMS tables in PostgreSQL | Payload `/admin` authentication |

The default `compose.yaml` is unchanged in behavior: `docker compose up --build -d` runs the browser-only demo with no database setup.

## Start with local PostgreSQL (Docker)

1. Copy `.env.example` to `.env`.
2. Set `NEXT_PUBLIC_DEMO_MODE=false`, a random `PAYLOAD_SECRET` (e.g. `openssl rand -hex 32`), and a strong `POSTGRES_PASSWORD`. Do not commit `.env`.
3. Build and start PostgreSQL and the app:

```sh
docker compose -f compose.yaml -f compose.postgres.yaml up --build -d
docker compose -f compose.yaml -f compose.postgres.yaml ps
```

The PostgreSQL service is not exposed on a host port; the app accesses `db:5432` over the Compose network. Data is stored in the named `postgres-data` Docker volume. The application is exposed on port 3000.

**Schema initialization:** This application includes a checked-in PostgreSQL migration and passes it to Payload's `prodMigrations` option, so a production server applies outstanding migrations when it first connects to an empty database. Review migrations before deploying, and take a backup before upgrades.

## Connect to an existing PostgreSQL database

Configure `NEXT_PUBLIC_DEMO_MODE=false`, `PAYLOAD_SECRET` and `DATABASE_URL=postgresql://user:password@host:5432/database` in the application environment, then run your build/deployment. Hosted DB providers often require TLS: set the connection URI / pool SSL options appropriate to your provider.

For Compose, override the app's `DATABASE_URL` in your deployment Compose configuration and omit the bundled `db` service. Do not expose your password to the browser or commit credentials. Check network access and TLS first.

## Schema migrations

Payload's PostgreSQL adapter automatically synchronizes the schema in **development mode**. For future database model changes, generate and commit migration files during development. The production server will run committed migrations on startup:

```sh
# Against a disposable development PostgreSQL instance:
pnpm payload migrate:create initial-postgres --skip-empty
# Against the intended PostgreSQL instance:
pnpm payload migrate
```

**Do not run `migrate:fresh` against existing data.** A completed production initialization requires migration files and successful execution. Do not consider a passing Docker build alone proof that database initialization, auth, or writes work.

## Verify persistence

Once the database schema exists:
1. Open `/admin` and create/sign in with an administrator account.
2. Create an equipment record, then a material record and serialized component.
3. Restart the application container; verify the data remains accessible.
4. Confirm that demo mode still loads its sample records when enabled.

## Deployment safeguards

- Always use a strong Payload secret and PostgreSQL password.
- Set `NEXT_PUBLIC_DEMO_MODE=false` **at build time**, since Next.js embeds public environment values.
- Back up PostgreSQL independently from the container image.
- Persistent media uploads require an additional durable filesystem mount or object-storage provider; the database alone does not preserve uploaded files.
- No pre-existing SQLite/Figma data is automatically migrated by switching adapters.
