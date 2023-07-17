import { minify } from "terser";

// NOTE: Remove in case https://github.com/vitejs/vite/issues/6585 or an equivalent is ever merged.
/**
 * This plugin forces ESM minification in the `renderChunk` hook for the `pf1.js` file.
 * This is necessary because Vite force-disabled minification for ESM files to protect developers from themselves,
 * and added no ability for devs to acknowledge the risk and force it anyway.
 * PRs and issues regarding this are in eternal limbo, see #6555 for the latest.
 *
 * Using the rollup terser plugin fails to minify whitespace for some reason,
 * so this plugin uses the terser API directly.
 *
 * @returns {import("vite").Plugin} A Vite plugin that forcibly minifies `pf1.js`
 */
export default function forceMinifyEsm() {
  return {
    name: "forceMinifyEsm",
    renderChunk: {
      order: "post",
      async handler(code, chunk, outputOptions) {
        if (outputOptions.format === "es" && chunk.fileName === "pf1spheres.js") {
          return await minify(code, {
            keep_classnames: true,
            keep_fnames: true,
            ecma: 2020,
            module: true,
            compress: { unsafe: true },
            sourceMap: { content: chunk.map },
          });
        }
        return { code, map: chunk.map };
      },
    },
  };
}
