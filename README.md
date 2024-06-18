<!--
SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>

SPDX-License-Identifier: EUPL-1.2
-->

<h1 style="text-align: center" align="center">
  Spheres for Pathfinder 1e
</h1>

<div style="text-align: center" align="center">
  <img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/Ethaks/pf1spheres/check.yaml?label=checks">
  <a href="https://codecov.io/github/Ethaks/pf1spheres" >
    <img src="https://codecov.io/github/Ethaks/pf1spheres/graph/badge.svg?token=5Y6KSB2WTO"/>
  </a>
  <a href="https://github.com/Ethaks/pf1spheres/releases/latest">
    <img src="https://img.shields.io/github/downloads/Ethaks/pf1spheres/latest/module.zip" alt="Downloads" />
  </a>
  <a href="https://forge-vtt.com/bazaar#package=pf1spheres">
    <img src="https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fpf1spheres&colorB=4aa94a" alt="Forge Install %" />
  </a>
  <br />
  <a href="https://www.foundryvtt-hub.com/package/pf1spheres/">
    <img src="https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Fpf1spheres%2Fshield%2Fendorsements" alt="Foundry Hub Endorsements" />
  </a>
  <img src="https://img.shields.io/endpoint?url=https://foundryshields.com/version?url=https://github.com/Ethaks/pf1spheres/releases/latest/download/module.json" alt="Supported Foundry Versions" />
</div>

This module for the [Pathfinder 1e game system](https://gitlab.com/foundryvtt_pathfinder1e/foundryvtt-pathfinder1) for [Foundry Virtual Tabletop](http://foundryvtt.com/) provides additional functionality and support for the rule sets [Spheres of Power](https://www.dropdeadstudios.com/spheres-of-power) and [Spheres of Might](https://www.dropdeadstudios.com/spheres-of-might) from [Drop Dead Studios](https://www.dropdeadstudios.com/).

As the module is still heavily in development, the best source for available features and notable changes is its [changelog](CHANGELOG.md).

## Installation

To install the module navigate to Foundry's _Add-on Modules_ tab in the Setup menu and paste the following link in the **Install Module** dialog:

[https://github.com/ethaks/pf1spheres/releases/latest/download/module.json](https://github.com/ethaks/pf1spheres/releases/latest/download/module.json)

The module can also be installed manually by downloading a zip archive from the Releases Page and extracting it to Foundry's `Data/modules/pf1spheres` directory.

## Development

### Prerequisites

In order to build this module, recent versions of `node` and `npm` are required.
Most likely using `yarn` also works but only `npm` is officially supported.
If you use `nvm` to manage your `node` versions, you can simply run

```bash
nvm install
```

in the project's root directory.

You also need to install the project's dependencies. To do so, run

```bash
npm ci
```

### Building

You can build the project by running

```bash
npm run build
```

Alternatively, you can run

```bash
npm run build:watch
```

to watch for changes and automatically build as necessary.

### Linking the built project to Foundry VTT

In order to provide a fluent development experience, it is recommended to link
the built module to your local Foundry VTT installation's data folder. In
order to do so, first add a file called `foundryconfig.json` to the project root
with the following content:

```json
{
  "dataPath": "/absolute/path/to/your/FoundryVTT/Data"
}
```

(if you are using Windows, make sure to use `\` as a path separator instead of `/`)

Then run

```bash
npm run link-package
```

On Windows, creating symlinks requires administrator privileges so unfortunately
you need to run the above command in an administrator terminal for it to work.

### Running the tests

You can run the tests with the following command:

```bash
npm test
```

A manual type checking process can be started by running

```bash
npm run typecheck
```

This project uses [Vite](https://vitejs.dev/).
After having built the module as least once as per [building](#Building), you can start a development server by running

```bash
npm run serve
```

This development server runs on port `30001`, and is able to hot reload CSS and Handlebars template changes, as well as offering some reload functionality for TS code changes.

## Legal

The software component of this system is licensed primarily under the EUPL v. 1.2.
REUSE is used to specify licenses for individual files in the form of headers or `.license` files, or in `.reuse/dep5`.
The rules and game content is distributed under the terms of the Open Gaming License v1.0a.
The terms of the [Foundry Virtual Tabletop End User License Agreement](https://foundryvtt.com/article/license/) apply.

This system uses trademarks and/or copyrights owned by Paizo Inc., which are used under [Paizo's Community Use Policy](https://paizo.com/community/communityuse).
We are expressly prohibited from charging you to use or access this content.
This module is not published, endorsed, or specifically approved by Paizo Inc.
For more information about Paizo's Community Use Policy, please visit [paizo.com/communityuse](paizo.com/communityuse).
For more information about Paizo Inc. and Paizo products, please visit [paizo.com](paizo.com).
