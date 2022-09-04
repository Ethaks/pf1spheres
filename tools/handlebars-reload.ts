/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { Plugin, ViteDevServer } from "vite";
import * as chokidar from "chokidar";
import path from "path";
import fs from "fs-extra";
import { removePrefix } from "./foundry-config";
import { ViteLoggerPFS } from "./vite-logger";

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
      const logger = new ViteLoggerPFS(config.logger);
      const watchPath = path.resolve(config.publicDir, "**/*.hbs");
      watcher = chokidar.watch(watchPath);
      // Clean up base dir to determine file placement within Foundry
      const foundryBaseDir = config.base
        .split(path.sep)
        .join(path.posix.sep)
        .replace(/^\/+|\/+$/g, "");

      watcher.on("change", async (file) => {
        if (file.endsWith("hbs")) {
          // Transform OS path into Foundry-suitable path
          const filepathUrl = path
            .relative(config.publicDir, file)
            .split(path.sep)
            .join(path.posix.sep)
            .replace(/^\/+|\/+$/g, "");
          const foundryPath = `${removePrefix(foundryBaseDir)}/${filepathUrl}`;

          // Shortened relative path for display purposes
          const fileFromRoot = path.relative(config.root, file);

          // Trigger hot reload within dev server/Foundry
          const content = await fs.readFile(file, { encoding: "utf8" });
          logger.info(`Reload ${fileFromRoot} as ${foundryPath}`);
          server.ws.send({
            type: "custom",
            event: "hotHandle:update",
            data: { file: foundryPath, content },
          });

          // Also copy template to `dist` to persist the change
          const distFile = path.resolve(config.build.outDir, path.relative(config.publicDir, file));
          await fs.copy(file, distFile);
          logger.info(`Copied ${fileFromRoot} to ${path.relative(config.root, distFile)}`);
        }
      });
    },

    async buildEnd() {
      await watcher.close();
    },
  };
}
