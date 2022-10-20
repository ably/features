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

### Lint, Test, Build and Preview

Always inspect our
[GitHub workflow files](.github/workflows/)
as the canonical reference as to what commands are performed in CI,
however the following command will lint source files, run tests and build the HTML micro-site:

```bash
npm run lint && npm test && npm run build
```

The `npm run build` command generates a folder called `output/` which is
[intentionally ignored by Git](.gitignore).
Developers using macOS can open this file in their web browser with:

    open output/index.html

which will open it using the `file://` URL loading scheme.

If you make a change to a source file then you will need to, at a minimum, execute `npm run build` again and then refresh your browser.

We plan to improve this developer experience when we work on
[#84](https://github.com/ably/features/issues/84),
by adding a local development HTTP server.
