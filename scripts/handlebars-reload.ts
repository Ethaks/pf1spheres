/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { Plugin, ViteDevServer } from "vite";
import * as chokidar from "chokidar";
import path from "path";
import fs from "fs-extra";

let server: ViteDevServer;
let watcher: chokidar.FSWatcher;

/**
 * A plugin that watches the `publicDir` for changes to `.hbs` files, triggering a hot reload within Foundry
 */
export default function handlebarsReload(): Plugin {
  return {
    name: "handlebars-hot-reload",
    configureServer(resolvedServer) {
      server = resolvedServer;
    },

    configResolved(config) {
      const watchPath = path.resolve(config.publicDir, "**/*.hbs");
      watcher = chokidar.watch(watchPath);
      const foundryBaseDir = config.base.replace(/^\/+|\/+$/g, "");
      watcher.on("change", (file) => {
        if (file.endsWith("hbs")) {
          const foundryPath = `${foundryBaseDir}/${path.relative(config.publicDir, file)}`;
          const content = fs.readFileSync(file, { encoding: "utf8" });
          config.logger.info(`Reload ${file} as ${foundryPath}`);
          server.ws.send({
            type: "custom",
            event: "hotHandle:update",
            data: { file: foundryPath, content },
          });
        }
      });
    },

    async buildEnd() {
      await watcher.close();
    },
  };
}
