// SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
//
// SPDX-License-Identifier: EUPL-1.2

// This file is only required by the dev server
// In a production setting, Foundry loads the bundled `pf1spheres.js` file in the module's directory
// In a development setting, Vite loads `index.html` -> this file -> `pf1spheres.ts`
window.global = window;
import "./module/pf1spheres.ts";
