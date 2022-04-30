/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import { MODULE_ID } from "./util";

// IMPORTANT: Types have to be added and maintained manually, as importing them will trigger typecheck errors
// due to this repo's tsconfig being applied to node_modules.
interface HandlebarsReloadData {
  file: string;
  content: string;
}

// @ts-expect-error Vite specific HMR handler
if (import.meta.hot) {
  // Handle
  // @ts-expect-error Vite specific HMR handler
  import.meta.hot.on("hotHandle:update", ({ file, content }: HandlebarsReloadData) => {
    const compiled = Handlebars.compile(content);
    Handlebars.registerPartial(file, compiled);
    _templateCache[file] = compiled;
    console.log(`${MODULE_ID} | Compiled template ${file}`);
  });
}
