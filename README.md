# Material History

Material History is a web application for managing equipment histories, maintenance records, serialized components, and review workflows.

Built with **Next.js 16**, **React 19**, **Payload CMS 4 (beta)**, **TypeScript**, and **Tailwind CSS 4**.

> **Migration status:** The `chore/remove-figma-dependencies` branch removes Figma Make integration. Automated dependency installation, Payload generation, TypeScript checking, production build, and a development-server homepage smoke test have passed. Database write workflows, admin login, and persistent file storage still require hands-on testing before production use.

## Features

- Equipment hierarchy and equipment records
- Maintenance and material history records
- Serialized-component tracking
- Review and approval status workflows
- Dashboard, search, and reporting interface
- Payload CMS administration and API

## Database-free demo mode

The frontend can run with **no database setup or database connection** using the existing sample records, components, and equipment hierarchy.

Set `NEXT_PUBLIC_DEMO_MODE=true` in your `.env` file (included in `.env.example` and new Codespaces), then run `pnpm dev` and visit **http://localhost:3000**. The demo includes 72 material records, 30 components, and a sample equipment hierarchy.

- Demo forms for adding equipment, components, and maintenance records are simulated; browser `localStorage` retains changes between reloads on the same browser.
- This is **not** server-side persistence. Clearing site data or using another browser resets the demo. Never enter real information.
- The demo role selector simulates user roles and is **not authentication**.
- Payload CMS routes such as `/admin` and `/api` are **not part of database-free mode**; they still need a database and the real Payload authentication setup.
- To return to database-backed behavior, set `NEXT_PUBLIC_DEMO_MODE=false` and restart the server. The existing Payload CMS configuration is unchanged.

## Quick start (local)

**Prerequisites:** Node.js 24.22.1 or newer, and Corepack / pnpm 10.

```bash
git clone https://github.com/tylertodd93-arch/material-history-2.git
cd material-history-2
git switch chore/remove-figma-dependencies

corepack enable
corepack prepare pnpm@10 --activate

cp .env.example .env
# Replace PAYLOAD_SECRET in .env with a strong, random value.
# Example: openssl rand -hex 32

pnpm install --frozen-lockfile
pnpm generate:importmap
pnpm generate:types
pnpm dev
```

Open **http://localhost:3000** for the app or **http://localhost:3000/admin** for Payload administration.

For the initial Payload admin account, use the first-user setup flow in `/admin`; later administrator accounts require appropriate admin authorization.

### Environment variables

Copy `.env.example` to `.env` and provide:

| Variable | Purpose | Local example |
| --- | --- | --- |
| `PAYLOAD_SECRET` | Required secret for Payload sessions and signing | Generate a long random value |
| `DATABASE_URL` | SQLite database location for local development | `file:./material-history.db` |
| `NEXT_PUBLIC_SITE_URL` | App base URL used for metadata | `http://localhost:3000` |

Do not commit `.env`, credentials, or local databases.

## Run in GitHub Codespaces

A `.devcontainer` setup is included for browser-based development.

1. [Create a Codespace on the migration branch](https://github.com/codespaces/new?repo=1447215897&ref=chore%2Fremove-figma-dependencies).
2. Create the Codespace and let its setup script install dependencies and generate the Payload files.
3. Run `pnpm dev` in the Codespaces terminal.
4. Open the forwarded **port 3000** to view Material History.

Codespaces may incur usage charges depending on your GitHub plan.

## Validation

```bash
pnpm check:types
pnpm build
```

GitHub Actions also runs these checks automatically. It installs dependencies, regenerates Payload types and the import map, builds the application, and smoke-tests the development server and homepage.

[View validation workflow](https://github.com/tylertodd93-arch/material-history-2/actions/workflows/validate.yml)

**Latest confirmed checks (November 5, 2026):** Installation, Payload generation, TypeScript, production build, and homepage HTTP smoke test passed. This is not a substitute for end-to-end workflow testing.

## Project structure

| Directory | Purpose |
| --- | --- |
| `src/app/(frontend)` | Material History app routes, layout, and server actions |
| `src/components` | Frontend application UI |
| `src/collections` | Equipment, records, serialized components, admins, media, and related Payload collections |
| `src/app/(payload)` | Payload CMS admin and API routes |
| `src/payload.config.ts` | Standalone Payload configuration and SQLite adapter |
| `src/data` | Mock/fallback UI data |
| `.devcontainer` | Browser-based development environment |
| `.github/workflows` | Automated checks |

## Moving away from Figma Make

This branch removes `@payloadcms/figma`, Figma-specific Next.js configuration, image loader, preview routes, and managed Figma SSO integration. It configures the official Payload SQLite adapter, native Payload admin authentication, and local media uploads.

**The migration changes application source code, not hosted data.** Existing Figma Cloud database records, administrator identities, and uploaded media have **not** been exported or migrated.

Before a real-world deployment:

1. Verify first-admin onboarding, login/logout, and access permissions.
2. Test creating, updating, and retrieving equipment, maintenance records, and serialized components.
3. Verify approval workflow restrictions and file uploads.
4. Migrate and reconcile existing database records and relationships, if needed.
5. Use durable, backed-up database and file storage. Local SQLite and uploads require a persistent disk; ephemeral hosting will lose data.
6. Retest all critical workflows before merging the draft migration PR or deploying.

## Branch and pull request

The standalone migration is tracked in [pull request #1](https://github.com/tylertodd93-arch/material-history-2/pull/1). The `main` branch remains unchanged until the PR is intentionally merged.
