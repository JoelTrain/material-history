#!/usr/bin/env bash
set -euo pipefail
corepack enable
corepack prepare pnpm@10 --activate
if [ ! -f .env ]; then
  {
    printf 'PAYLOAD_SECRET=%s\n' "$(openssl rand -hex 32)"
    printf 'DATABASE_URL=file:./material-history.db\n'
    printf 'NEXT_PUBLIC_SITE_URL=http://localhost:3000\n'
  } > .env
  chmod 600 .env
fi
pnpm install --no-frozen-lockfile
pnpm generate:importmap
pnpm generate:types
echo "Setup finished. Run: pnpm dev"
