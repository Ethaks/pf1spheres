# pf1spheres

This module for the [Pathfinder 1e game system](https://gitlab.com/Furyspark/foundryvtt-pathfinder1) for [Foundry Virtual Tabletop](http://foundryvtt.com/) provides additional functionality and support for the rule sets [Spheres of Power](https://www.dropdeadstudios.com/spheres-of-power) and [Spheres of Might](https://www.dropdeadstudios.com/spheres-of-might) from [Drop Dead Studios](https://www.dropdeadstudios.com/).

## Installation

To install the module navigate to Foundry's _Add-on Modules_ tab in the Setup menu and paste the following link in the **Install Module** dialog:

[https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/-/raw/latest/system.json](https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/-/raw/latest/system.json)

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

You also need to install the the project's dependencies. To do so, run

```
npm install
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

## Legal

The software component of this system is distributed under the EUPL v. 1.2.
The rules and game content is distributed under the terms of the Open Gaming License v1.0a.
The terms of the [Foundry Virtual Tabletop End User License Agreement](https://foundryvtt.com/article/license/) apply.
