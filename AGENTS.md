# Material History

Standalone Next.js / React / Payload CMS application.

## Project overview
- Frontend: `src/app/(frontend)/`, `src/components/`
- Backend: Payload CMS collections in `src/collections/`
- Payload configuration: `src/payload.config.ts`
- Payload admin routes: `src/app/(payload)/`
- Styling: Tailwind CSS v4 and `src/app/(frontend)/styles.css`

## Development
- Use Node 24.22.1+ and pnpm.
- Copy `.env.example` to `.env`; generate a strong `PAYLOAD_SECRET`.
- Install packages: `corepack pnpm install`
- Regenerate the Payload import map: `corepack pnpm generate:importmap`
- Regenerate types: `corepack pnpm generate:types`
- Start dev server: `corepack pnpm dev`
- Verify: `corepack pnpm check:types` and `corepack pnpm build`

## Engineering guidance
- Preserve the Material History UI, data collections, and application workflows.
- Do not change data models without planning and validating migration.
- Use standard Payload database adapters, local media uploads, and native admin authentication.
- Keep secrets server-side and out of committed files.
- Validate permissions and workflow invariants at the collection boundary.
- Do not disable TypeScript build errors.
- Do not deploy persistent SQLite data to ephemeral storage without a durable volume or an alternative hosted database.
