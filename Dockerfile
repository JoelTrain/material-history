# syntax=docker/dockerfile:1
# Use Debian for reliable compatibility with native sharp / SQLite dependencies.
FROM node:24-bookworm-slim AS dependencies
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@10 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM dependencies AS builder
WORKDIR /app
COPY . .
# Next.js inlines NEXT_PUBLIC_* variables at build time. Rebuild to switch modes.
ARG NEXT_PUBLIC_DEMO_MODE=true
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_DEMO_MODE=${NEXT_PUBLIC_DEMO_MODE}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
# Only required by Payload during compilation. The runtime secret is supplied by Compose.
ENV PAYLOAD_SECRET=build-time-placeholder-not-a-runtime-secret
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/material_history
RUN pnpm generate:importmap && pnpm generate:types && pnpm build

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000
# Next.js standalone output includes production dependencies and server.js.
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
# There is no public/ directory in this repository at present.
RUN mkdir -p /app/data && chown -R node:node /app/data
COPY --from=builder --chown=node:node /app/docker/start.mjs ./start.mjs
USER node
EXPOSE 3000
CMD ["node", "start.mjs"]
