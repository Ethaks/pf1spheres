// SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
//
// SPDX-License-Identifier: EUPL-1.2

import path from "node:path";

import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";
import checker from "vite-plugin-checker";
import { copy } from "@guanghechen/rollup-plugin-copy";

import handlebarsReload from "./tools/handlebars-reload.js";
import langReload from "./tools/lang-reload";
import forceMinifyEsm from "./tools/minify.mjs";
import { FOUNDRY_CONFIG, resolveUrl } from "./tools/foundry-config";

function resolve(relativePath: string) {
  return path.resolve(__dirname, relativePath);
}

const COPY_FILES = ["CREDITS.md", "LICENSES", "LICENSE", ".reuse"].map(resolve);

const config = defineConfig({
  root: "src/",
  base: resolveUrl("modules/pf1spheres/"),
  publicDir: resolve("public"),
  server: {
    port: 30001,
    open: FOUNDRY_CONFIG.openBrowser ?? false,
    proxy: {
      [`^(?!${resolveUrl("modules/pf1spheres")})`]: "http://localhost:30000/",
      [resolveUrl("socket.io")]: {
        target: "ws://localhost:30000",
        ws: true,
      },
    },
  },
  build: {
    outDir: resolve("dist"),
    emptyOutDir: true,
    sourcemap: true,
    target: "es2022",
    minify: false,
    rollupOptions: {
      output: {
        sourcemapPathTransform: (relative) => {
          // Relative paths start with a `../`, which moves the path out of the module's directory.
          if (relative.startsWith("../")) relative = relative.replace("../", "");
          return relative;
        },
      },
    },
    reportCompressedSize: true,
    lib: {
      name: "pf1spheres",
      entry: resolve("src/module/pf1spheres.ts"),
      formats: ["es"],
      fileName: () => "pf1spheres.js",
    },
  },
  plugins: [
    checker({
      typescript: true,
    }),
    forceMinifyEsm(),
    visualizer({
      gzipSize: true,
      template: "treemap",
    }),
    copy({ targets: [{ src: COPY_FILES, dest: resolve("dist") }], hook: "writeBundle" }),
    handlebarsReload(),
    langReload(),
  ],
});

export default config;
