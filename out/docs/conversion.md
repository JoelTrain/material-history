# Conversion Report

This report records how settings from the Compose model were handled during UDS package conversion.

## Translated settings

| Setting | Result | Details |
| --- | --- | --- |
| `name` | package metadata name | Used the Compose project name as the generated package identity. |
| `networks.default` | UDS network policy selectors | Translated this Compose setting into generated package configuration. |
| `services.app.build.args` | generated Buildx Bake service | Translated this Compose setting into generated package configuration. |
| `services.app.build.context` | generated Buildx Bake service | Translated this Compose setting into generated package configuration. |
| `services.app.build.dockerfile` | generated Buildx Bake service | Translated this Compose setting into generated package configuration. |
| `services.app.depends_on` | Deployment dependency init containers | Translated this Compose setting into generated package configuration. |
| `services.app.environment` | environment ConfigMap and deploy-time variables | Translated this Compose setting into generated package configuration. |
| `services.app.expose` | Kubernetes Service ports | Translated this Compose setting into generated package configuration. |
| `services.app.healthcheck` | Deployment liveness probe | Translated this Compose setting into generated package configuration. |
| `services.app.networks` | UDS network policy selectors | Translated this Compose setting into generated package configuration. |
| `services.app.ports` | Kubernetes Service ports | Translated this Compose setting into generated package configuration. |
| `services.app.volumes[0]` | Deployment volume mount | Translated this Compose setting into generated package configuration. |
| `services.db.environment` | environment ConfigMap and deploy-time variables | Translated this Compose setting into generated package configuration. |
| `services.db.expose` | Kubernetes Service ports | Translated this Compose setting into generated package configuration. |
| `services.db.healthcheck` | Deployment liveness probe | Translated this Compose setting into generated package configuration. |
| `services.db.image` | Zarf package image and Deployment container image | Translated this Compose setting into generated package configuration. |
| `services.db.networks` | UDS network policy selectors | Translated this Compose setting into generated package configuration. |
| `services.db.volumes[0]` | Deployment volume mount | Translated this Compose setting into generated package configuration. |
| `volumes.material-history-data` | PersistentVolumeClaim | Translated this Compose setting into generated package configuration. |
| `volumes.postgres-data` | PersistentVolumeClaim | Translated this Compose setting into generated package configuration. |

## Inferred settings

| Setting | Result | Details |
| --- | --- | --- |
| `services.app.image` | zarf.internal/material-history-app:dev | Generated an internal image reference for the local build. |
| `x-uds.metadata.name` | material-history | Inferred the package name and Kubernetes namespace from the Compose project name. |
| `x-uds.metadata.version` | dev | Defaulted the package version to dev for the UDS development workflow. |
| `x-uds.spec.network.allow` | ingress and egress | Inferred package-local network allow rules for generated workloads. |
| `x-uds.spec.network.expose` | app | Inferred a tenant gateway exposure from the service's published ports. |
| `x-uds.spec.sso` | app | Inferred default SSO client configuration from the service exposure. |

## Ignored settings

| Setting | Result | Details |
| --- | --- | --- |
| `services.app.image` | - | Local build services use a generated internal image reference instead of the Compose image setting. |
| `services.app.restart` | - | Kubernetes controls workload restarts, so the Compose restart policy is not translated. |
| `services.db.restart` | - | Kubernetes controls workload restarts, so the Compose restart policy is not translated. |

## Rejected settings

None.

