# Configuration

Set these values when deploying the generated Zarf package.

| Variable | Description | Default | Sensitive |
|---|---|---|---|
| `SUBDOMAIN` | Subdomain for the first inferred tenant-gateway endpoint and inferred SSO redirect URI; empty uses the Helm release namespace | — | false |
| `DOMAIN` | Cluster domain used by generated application endpoints | uds.dev | false |
| `ADDITIONAL_NETWORK_ALLOW` | Additional UDS network allow rules supplied as a YAML array | [] | false |
| `APP_CPU_REQUEST` | CPU request for Compose service app | — | false |
| `APP_MEMORY_REQUEST` | Memory request for Compose service app | — | false |
| `APP_CPU_LIMIT` | CPU limit for Compose service app | — | false |
| `APP_MEMORY_LIMIT` | Memory limit for Compose service app | — | false |
| `APP_DATABASE_URL` | Value for DATABASE_URL environment variable on Compose service app | file:/app/data/material-history.db | false |
| `APP_HOSTNAME` | Value for HOSTNAME environment variable on Compose service app | 0.0.0.0 | false |
| `APP_NEXT_PUBLIC_DEMO_MODE` | Value for NEXT_PUBLIC_DEMO_MODE environment variable on Compose service app | true | false |
| `APP_NEXT_PUBLIC_SITE_URL` | Value for NEXT_PUBLIC_SITE_URL environment variable on Compose service app | http://localhost:3000 | false |
| `APP_NODE_ENV` | Value for NODE_ENV environment variable on Compose service app | production | false |
| `APP_PAYLOAD_SECRET` | Value for PAYLOAD_SECRET environment variable on Compose service app | demo-only-do-not-use-in-production | false |
| `APP_PORT` | Value for PORT environment variable on Compose service app | 3000 | false |
