// SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
//
// SPDX-License-Identifier: EUPL-1.2

import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";
import checker from "vite-plugin-checker";
import path from "path";
import copy from "@guanghechen/rollup-plugin-copy";
import handlebarsReload from "./scripts/handlebars-reload";

function resolve(relativePath: string) {
  return path.resolve(__dirname, relativePath);
}

const COPY_FILES = ["CREDITS.md", "LICENSES", "LICENSE", ".reuse"].map(resolve);

const config = defineConfig({
  root: "src/",
  base: "/modules/pf1spheres/",
  publicDir: resolve("public"),
  server: {
    port: 30001,
    open: true,
    proxy: {
      "^(?!/modules/pf1spheres)": "http://localhost:30000/",
      "/socket.io": {
        target: "ws://localhost:30000",
        ws: true,
      },
    },
  },
  esbuild: {
    minifySyntax: true,
    minifyWhitespace: true,
    keepNames: true,
  },
  build: {
    outDir: resolve("dist"),
    emptyOutDir: true,
    sourcemap: true,
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
    visualizer({
      gzipSize: true,
      template: "treemap",
    }),
    copy({ targets: [{ src: COPY_FILES, dest: resolve("dist") }], hook: "writeBundle" }),
    handlebarsReload(),
  ],
});

export default config;
