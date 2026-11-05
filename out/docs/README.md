# material-history

This UDS package was generated from Docker Compose. Zarf deploys the material-history application to the material-history namespace by default and controls namespace creation and placement.

## Build

Build the generated package with its inferred flavor:

```sh
zarf package create . --flavor upstream
```

## Package documentation

- [Configuration](configuration.md) describes the package's deploy-time settings.
- [Dependencies](dependencies.md) lists the application services, images, and service dependencies.

Regenerate this package after changing the source Compose project; generated files are not intended for manual editing.
