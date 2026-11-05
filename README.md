# Material History

A standalone Next.js application for equipment, maintenance, and serialized-component history, backed by Payload CMS.

## Requirements
- Node.js 24.22.1+ and pnpm 9, 10, or 11
- Local persistent storage for development (SQLite)
- A backed-up database and persistent media storage for production

## Local setup

```sh
cp .env.example .env
# Edit .env and set a long random PAYLOAD_SECRET. Do not commit it.
corepack pnpm install
corepack pnpm generate:importmap
corepack pnpm generate:types
corepack pnpm dev
```

Open `http://localhost:3000`. Admin UI is at `http://localhost:3000/admin`.
Set up the first native Payload admin using the Payload initial-user setup flow. The existing `admins` collection remains the CMS administrator model. Subsequent administrators require admin access.

## Validation

```sh
corepack pnpm check:types
corepack pnpm build
```

Regenerate and **commit** `pnpm-lock.yaml` after the first successful install. Existing npm/pnpm lockfiles were removed because they included the Figma plugin and no dependency install could be run while preparing this commit. Prefer a single package manager.

## Migration notes

- Removed `@payloadcms/figma` and the platform-specific `buildFigmaConfig`.
- Uses Payload's `buildConfig`, the official `@payloadcms/db-sqlite` adapter, and environment-based secrets.
- Uses Payload's native admin authentication and default admin logout behavior instead of Figma SSO.
- Stores media with Payload's default local upload behavior; production requires persistent volume or a supported storage adapter.
- Removes Figma preview routes, image loader, generated Figma commands, and site settings.
- The existing frontend, equipment, maintenance, and component data models were retained.

### Data preservation

**This source migration does not copy Figma Cloud content.** Export existing Payload records, admin accounts (recreate or migrate with secure password reset), and media from the previous environment before retiring it. Database IDs, relationships, and file paths must be mapped and verified during migration. Do not treat a clean local SQLite database as a copy of production data.

### Deployment

SQLite on local disk is suitable for development and persistent single-instance hosting. For scalable production, migrate to a supported managed database such as PostgreSQL and configure persistent media storage. Set `PAYLOAD_SECRET`, `DATABASE_URL`, and `NEXT_PUBLIC_SITE_URL` for your deployment target. Back up both the database and media.

### Validation status

Files were prepared via the GitHub integration. Dependency installation, lockfile generation, type checking, and a production build have **not** been executed and are required before deployment. This repository currently targets Payload 4.0.0-beta.4; verify adapter compatibility and consider an intentional upgrade to stable Payload after functional testing.
