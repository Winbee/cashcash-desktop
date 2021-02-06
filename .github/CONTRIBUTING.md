# Cashcash Contributing Guide

Hi! I'm really excited that you are interested in contributing to Cashcash. Before submitting your contribution, please make sure to take a moment and read through the following guidelines:

-   [Issue Reporting Guidelines](#issue-reporting-guidelines)
-   [Pull Request Guidelines](#pull-request-guidelines)
-   [Development Setup](#development-setup)
-   [Project Structure](#project-structure)

## Issue Reporting Guidelines

-   Always use the [github templates/](https://github.com/Winbee/cashcash-desktop/issues/new/choose) to create new issues.

## Pull Request Guidelines

-   The `master` branch is the active branch.

-   Checkout the master branch and merge back against that branch.

-   Work in the `src` folder.

-   It's OK to have multiple small commits as you work on the PR - GitHub will automatically squash it before merging.

-   If adding a new feature:

    -   Provide a convincing reason to add this feature. Ideally, you should open a suggestion issue first and have it approved before working on it.

-   If fixing bug:
    -   If you are resolving a special issue, add `(fix #xxxx[,#xxxx])` (#xxxx is the issue id) in your PR title for a better release log, e.g. `update entities encoding/decoding (fix #3899)`.
    -   Provide a detailed description of the bug in the PR. Live demo preferred.

## Development Setup

You will need [Node.js](http://nodejs.org) **version 12+** and [yarn](https://yarnpkg.com/en/docs/install).

After cloning the repo, run:

```bash
$ yarn # install the dependencies of the project
```

### Committing Changes

Commit messages should follow the [commit message convention](./COMMIT_CONVENTION.md) so that changelogs can be automatically generated. Commit messages will be automatically validated upon commit. If you are not familiar with the commit message convention, you can use `npm run commit` instead of `git commit`, which provides an interactive CLI for generating proper commit messages.

### Commonly used NPM scripts

```bash
# Generate the icons needed for the installer (You only need to run once if you don't modify the icons)
$ yarn generate-icons

# Run the app in dev mode and watch for file change
$ yarn serve

# Build the app installer
$ yarn build

```

There are some other scripts available in the `scripts` section of the `package.json` file.

## Project Structure

-   **`build-win`**: contains the metadata needed to generate a windows installer.

-   **`icons`**: contains the icons of the app.

-   **`public`**: contains the static files used as the entrypoint of the electron browser

-   **`src`**: contains the source code. The codebase is written in Typescript and VueJs.

    -   **`background.ts`** and **`background`** : contains the code that is ran on the main process (=backend)

    -   **`main.ts`** and **`renderer`**: contains the code that is ran on the renderer process (=frontend)

    -   **`locales`**: contains the translations in english and french

    -   **`migration`**: contains the SQL migrations needed for the SQLite database

## Credits

Thank you to all the people who have already contributed to Cashcash!
