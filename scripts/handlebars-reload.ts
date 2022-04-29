/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { Plugin, ResolvedConfig, ViteDevServer } from "vite";
import * as chokidar from "chokidar";
import path from "path";
import fs from "fs-extra";

let config: ResolvedConfig;
let server: ViteDevServer;
let watcher: chokidar.FSWatcher;

export default function handlebarsReload(): Plugin {
  return {
    name: "handlebars-hot-reload",
    configureServer(resolvedServer) {
      server = resolvedServer;
    },
    configResolved(resolvedConfig) {
      config = resolvedConfig;
      watcher = chokidar.watch(path.resolve(config.root, "../public/**/*.hbs"));
      watcher.on("change", (file) => {
        if (file.endsWith("hbs")) {
          const foundryPath = `modules/pf1spheres/${path.relative(config.publicDir, file)}`;
          const content = fs.readFileSync(file, { encoding: "utf8" });
          config.logger.info(`Reload ${file} as ${foundryPath}`);
          server.ws.send({
            type: "custom",
            event: "pf1s:handlebars-update",
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
