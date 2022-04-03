<!--
SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>

SPDX-License-Identifier: EUPL-1.2
-->

<div align="center">
  <h1>pf1spheres</h1>
  <img alt="Gitlab pipeline status" src="https://img.shields.io/gitlab/pipeline-status/Ethaks/foundryvtt-pf1-spheres?branch=master&label=Checks&logo=gitlab">
  <a href="https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/-/commits/spheres-tab"><img alt="coverage report" src="https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/badges/spheres-tab/coverage.svg" /></a>
  <img alt="Supported Foundry Versions" src="https://img.shields.io/endpoint?url=https://foundryshields.com/version?url=https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/-/releases/permalink/latest/downloads/module.json">
  <br>
  <a href="https://forge-vtt.com/bazaar#package=pf1spheres">
    <img src="https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fpf1spheres&colorB=4aa94a" alt="Forge Install %" />
  </a>
  <a href="https://www.foundryvtt-hub.com/package/pf1spheres/">
    <img src="https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Fpf1spheres%2Fshield%2Fendorsements" alt="Foundry Hub Endorsements" />
  </a>
</div>

This module for the [Pathfinder 1e game system](https://gitlab.com/Furyspark/foundryvtt-pathfinder1) for [Foundry Virtual Tabletop](http://foundryvtt.com/) provides additional functionality and support for the rule sets [Spheres of Power](https://www.dropdeadstudios.com/spheres-of-power) and [Spheres of Might](https://www.dropdeadstudios.com/spheres-of-might) from [Drop Dead Studios](https://www.dropdeadstudios.com/).

## Installation

To install the module navigate to Foundry's _Add-on Modules_ tab in the Setup menu and paste the following link in the **Install Module** dialog:

[https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/-/releases/permalink/latest/downloads/module.json](https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/-/releases/permalink/latest/downloads/module.json)

The module can also be installed manually by downloading a zip archive from the Releases Page and extracting it to Foundry's `Data/modules/pf1spheres` directory.

## Development

### Prerequisites

In order to build this module, recent versions of `node` and `npm` are required.
Most likely using `yarn` also works but only `npm` is officially supported.
If you use `nvm` to manage your `node` versions, you can simply run

```
nvm install
```

in the project's root directory.

You also need to install the project's dependencies. To do so, run

```
npm ci
```

### Building

You can build the project by running

```
npm run build
```

Alternatively, you can run

```
npm run build:watch
```

to watch for changes and automatically build as necessary.

### Linking the built project to Foundry VTT

In order to provide a fluent development experience, it is recommended to link
the built module to your local Foundry VTT installation's data folder. In
order to do so, first add a file called `foundryconfig.json` to the project root
with the following content:

```
{
  "dataPath": "/absolute/path/to/your/FoundryVTT/Data"
}
```

(if you are using Windows, make sure to use `\` as a path separator instead of
`/`)

Then run

```
npm run link-project
```

On Windows, creating symlinks requires administrator privileges so unfortunately
you need to run the above command in an administrator terminal for it to work.

### Running the tests

You can run the tests with the following command:

```
npm test
```

Since the regular esbuild job does not check for type errors, you can run the TypeScript compiler with

```
npm run typecheck
```

## Legal

The software component of this system is licensed primarily under the EUPL v. 1.2.
REUSE is used to specify licenses for individual files in the form of headers or `.license` files, or in .reuse/dep5.
The rules and game content is distributed under the terms of the Open Gaming License v1.0a.
The terms of the [Foundry Virtual Tabletop End User License Agreement](https://foundryvtt.com/article/license/) apply.
