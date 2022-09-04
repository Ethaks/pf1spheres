/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import * as chokidar from "chokidar";
import path from "node:path";
import { ViteLoggerPFS } from "./vite-logger.js";
import type { Plugin, ViteDevServer } from "vite";
import fs from "fs-extra";

let server: ViteDevServer;
let watcher: chokidar.FSWatcher;

const resolve = (root: string) => (target: string) => path.resolve(root, target);

/**
 * A plugin that watches the `lang` directory for changes, triggering a hot reload within Foundry
 */
export default function langReload(): Plugin {
  return {
    name: "lang-hot-reload",
    configureServer(resolvedServer) {
      server = resolvedServer;
    },

    async configResolved(config) {
      const logger = new ViteLoggerPFS(config.logger);
      // Set up watcher
      const resolveRoot = resolve(config.root);
      const watchPaths = resolveRoot("../public/lang/**/*.json");
      watcher = chokidar.watch(watchPaths, { ignoreInitial: false });
      watcher.on("change", async (file) => {
        const language = path.basename(file, ".json");
        const content: Record<string, unknown> = await fs.readJson(file, { encoding: "utf8" });

        // Trigger hot reload within dev server/Foundry
        server.ws.send({
          type: "custom",
          event: "hotLangs:update",
          data: { language, content },
        });
        logger.info(`Hot Reloading ${language}.json`);
      });
    },

    async buildEnd() {
      await watcher.close();
    },
  };
}
