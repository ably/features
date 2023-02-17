# Contributing to Ably Features

## Local Development Flow

### Required Development Tools

You'll need [Node.js](https://nodejs.org/) installed.
Consult [our `.tool-versions` file](.tool-versions) for the version that we use to validate and build in CI.
This file is of particular use to those using [asdf](https://asdf-vm.com/) or compatible tooling.

### Installing Dependencies

When you've just cloned the repository or you've switched branch, ensure that you've installed dependencies with:

    npm install

Or, alternatively, do a clean install to match exactly what we
[check](.github/workflows/check.yml)
and
[assemble](.github/workflows/assemble.yml)
in CI:

    npm ci

### Lint, Test and Preview

Always inspect our
[GitHub workflow files](.github/workflows/)
as the canonical reference as to what commands are performed in CI.

The following command will lint source files and run tests:

```bash
npm run lint && npm test
```

To serve the HTML micro-site in your local environment you can use:

```bash
npm start
```

The `npm start` command generates a folder called `output/` which is
[intentionally ignored by Git](.gitignore) and then spins up an HTTP server using the
[http-server](https://www.npmjs.com/package/http-server) dev dependency.
You will then be able to open up on your browser `http://127.0.0.1:8080/`
with the features matrix displayed and ready to be edited from the source files.

## Release Process

### Canonical Feature List Release Process

Use our standard [Release Process](https://github.com/ably/engineering/blob/main/sdk/releases.md#release-process), except there is no 'Publish Workflow' to be triggered in this repository.
This is because downstream users consume the contents of [`sdk.yaml`](sdk.yaml) using its GitHub raw URL for a given version tag (see [Usage](README.md#usage)).

The "Public API" of this repository, when it comes to assessing the "Trigger" for the Version Bump, is the structured presented in [`sdk.yaml`](sdk.yaml) (otherwise known as the canonical feature list).

### Core Business Logic Release Process

The files maintained within [the `core` folder](core/) define a package which is published to the npm registry [at `@ably/features-core`](https://www.npmjs.com/package/@ably/features-core).

To publish a new version of this package:

1. Increment the `version` [in `package.json`](core/package.json)
2. Run `npm install` from [the `core` folder](core/)
3. Run `npm install` from [the `render` folder](render/)
4. Commit the changes from steps 1 ([`package.json`](core/package.json)), 2 ([`core`'s `package-lock.json`](core/package-lock.json)) and 3 ([`render`'s `package-lock.json`](render/package-lock.json)) to the `main` branch
5. Run [the Publish Core workflow](https://github.com/ably/features/actions/workflows/publish-core.yml) against the `main` branch

Steps 1 thru 4 will usually be done via a release PR, as outlined in our guidance for [Release Process](https://github.com/ably/engineering/blob/main/sdk/releases.md#release-process).
