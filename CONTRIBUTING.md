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

### Lint, Test, and Preview

Always inspect our
[GitHub workflow files](.github/workflows/)
as the canonical reference as to what commands are performed in CI.

The following command will lint source files and run tests:

```bash
npm run lint && npm test
```

To serve the HTML micro-site in your local environment you can use:

```bash
npm run dev
```

The `npm run dev` command generates a folder called `output/` which is
[intentionally ignored by Git](.gitignore) and then spins up an HTTP server using the [live-server](https://www.npmjs.com/package/live-server)
dev dependency with hot reloading enabled.
Using this command will result in the browser of your choice opening a new tab on `http://127.0.0.1:8080/`
with the features displayed and ready to be edited from the source files.
