# Dependencies

The generated package contains these application services and container images.

| Service | Image | Depends on |
|---|---|---|
| `app` | `zarf.internal/material-history-app:dev` | db (service_healthy) |
| `db` | `postgres:17-bookworm` | — |

## Dependency startup waits

Each new Pod waits for its dependencies' first TCP ports; Compose healthy/completed conditions and ongoing health are not checked.

Zarf bundles the published TCP wait helper; no helper build is needed. Docker/Buildx is required only for application builds.
