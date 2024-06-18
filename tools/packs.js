/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import fs from "fs-extra";
import path from "node:path";
import url from "node:url";
import * as fvtt from "@foundryvtt/foundryvtt-cli";
import { Listr } from "listr2";
import pc from "picocolors";
import yargs from "yargs";
import yaml from "js-yaml";

const PACK_SRC = "../src/packs";
const PACK_CACHE = "../public/packs";

const __dirname = new url.URL(".", import.meta.url).pathname;
const __filename = url.fileURLToPath(import.meta.url);

/** Helper function that resolves a path from the pack source directory */
const resolveSource = (...file) => path.resolve(__dirname, PACK_SRC, ...file);
/** Helper function that resolves a path from the pack cache directory */
const resolveCache = (...file) => path.resolve(__dirname, PACK_CACHE, ...file);
/** Helper function that resolves a path from the pack destination directory */
const resolveDist = (...file) => path.resolve(__dirname, "../dist/packs", ...file);

if (process.argv[1] === __filename) {
  yargs(process.argv.slice(2))
    .demandCommand(1, 1)
    .command({
      command: "extract [packs...]",
      describe: `Extract packs from cache to source`,
      handler: async (argv) => {
        await extractPacks(argv.packs, { reset: !(argv.keepDeleted ?? true) });
      },
    })
    // Option to overwrite the default `reset` option
    .option("keepDeleted", { alias: "k", type: "boolean" })
    .command({
      command: "compile",
      describe: `Compile yaml files from source into dbs in cache`,
      handler: async () => {
        await compileAllPacks();
      },
    })
    .parse();
}

/**
 * Sluggify a string.
 *
 * This function will take a given string and strip it of non-machine-safe
 * characters, so that it contains only lowercase alphanumeric characters and
 * hyphens.
 *
 * @param {string} string String to sluggify.
 * @returns {string} The sluggified string
 */
function sluggify(string) {
  return string
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .replace(/\s+|-{2,}/g, "-");
}

/**
 * Santize pack entry.
 *
 * This resets an entry's permissions to default and removes all non-pf1(spheres) flags.
 *
 * @param {object} entry Loaded compendium content.
 * @returns {object} The sanitized content.
 */
function sanitizePackEntry(entry) {
  // Reset permissions to default
  delete entry.ownership;
  delete entry._stats;

  if ("pages" in entry && Array.isArray(entry.pages)) {
    for (const page of entry.pages) {
      sanitizePackEntry(page);
    }
  }

  // Always delete system migration marker
  delete entry.flags?.pf1?.migration;

  // Remove non-system/non-core flags
  for (const key of Object.keys(entry.flags)) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- wanton deletion is desired here
    if (!["pf1", "core", "pf1spheres"].includes(key)) delete entry.flags[key];
  }
  return entry;
}

/**
 * @typedef {object} PackOptions
 * @property {boolean} keepIds Whether existing IDs are to be kept, regardless of db ids
 * @property {boolean} reset Whether entries not in the db file are to be deleted
 */

/**
 * Extracts a single LevelDB, creating a directory with the db's name in {@link PACK_SRC},
 * and storing each entry in its own file.
 *
 * @param {string} packName - The directory name from {@link PACK_CACHE}
 * @param {object} [options={}] - Additional options to augment the behavior.
 * @param {boolean} [options.reset] - Whether to remove files not present in the db
 * @returns {Promise<PackResult>} The result of the extraction
 */
async function extractPack(packName, options = {}) {
  // This db directory in PACK_SRC
  const directory = resolveSource(path.basename(packName));
  if (!fs.existsSync(resolveDist(packName))) throw new Error(`${packName} does not exist`);

  // Index of already existing files, to be checked for files not touched with this extraction
  const filesBefore = [];
  const touchedFiles = [];
  /** @type {Map<string, Set<string>>} */
  const ids = new Map();
  let isFirstExtraction = false;
  if (!fs.existsSync(directory)) {
    isFirstExtraction = true;
    await fs.mkdir(directory);
  } else {
    for (const curFile of fs.readdirSync(directory)) {
      filesBefore.push(resolveSource(directory, curFile));
    }
  }

  // Find associated manifest pack data
  const manifest = fs.readJsonSync(path.resolve(__dirname, "../public/module.json"));
  const packData = manifest.packs.find((p) => {
    if (p.path) return path.basename(p.path) === packName;
    else return p.name === packName;
  });
  if (!packData) console.warn(`No data found for package ${packName} within the system manifest.`);

  await fvtt.extractPack(resolveDist(packName), resolveSource(directory), {
    transformEntry: (entry) => sanitizePackEntry(entry, packData?.type),
    transformName: (entry) => {
      const filename = `${sluggify(entry.name)}.${entry._id}.yaml`;

      // Abuse the callback to avoid having to read and parse the file later
      const file = resolveSource(directory, filename);
      touchedFiles.push(file);
      if (ids.has(entry._id)) ids.get(entry._id).add(file);
      else ids.set(entry._id, new Set([file]));

      return filename;
    },
    yaml: true,
    yamlOptions: {
      sortKeys: true, // Prevent random key drift
    },
  });

  const filesAfter = fs.readdirSync(directory).map((f) => resolveSource(directory, f));

  // Find all untouched files whose IDs could not be retrieved while extracting
  await Promise.all(
    filesAfter
      .filter((f) => f.endsWith("yaml") && !touchedFiles.includes(f))
      .map(async (file) => {
        const content = await fs.readFile(file, "utf-8");
        const parsed = yaml.load(content);
        const { _key, _id } = parsed;
        const idFromKey = _key?.split("!").at(-1);
        if (idFromKey !== _id) throw new Error(`ID mismatch in ${file}: ${idFromKey} !== ${_id}`);
        if (ids.has(_id)) ids.get(_id).add(file);
        else ids.set(_id, new Set([file]));
      }),
  );
  // Array of Sets containing conflicting files
  // const conflicts = [...ids.values()].filter((f) => f.size > 1);
  const conflicts = Object.fromEntries([...ids.entries()].filter(([, files]) => files.size > 1));
  const conflictingFileNames = new Set(
    Object.values(conflicts).flatMap((files) => [...files].map((f) => path.basename(f))),
  );

  // Find all files that were added by this run
  const addedFiles = isFirstExtraction ? [] : filesAfter.filter((f) => !filesBefore.includes(f)); //.filter((f) => !conflictingFiles.flat().includes(f));

  // Find all files that were not touched by this run (and thus are candidates for deletion);
  // exclude conflicting files, as they have to be checked manually
  const removedFiles = filesBefore.filter(
    (f) => !touchedFiles.includes(f) && !conflictingFileNames.has(f),
  );
  if (options.reset) {
    await Promise.all(removedFiles.map((f) => fs.remove(f)));
  }

  return { packName, addedFiles, removedFiles, conflicts };
}

/**
 * Extracts dbs from {@link PACK_CACHE} into {@link PACK_SRC}
 * If no packs are specified, all packs are extracted.
 *
 * @param {string[]} packNames - The names of the packs to extract
 * @param {object} [options={}] - Additional options to augment the behavior.
 * @param {boolean} [options.reset] - Whether to remove files not present in the db
 * @returns {Promise<PackResult[]>} An array of pack results
 */
async function extractPacks(packNames = [], options = {}) {
  const packDirs = await fs.readdir(resolveDist(), { withFileTypes: true });
  const packs = packNames.length ? packDirs.filter((p) => packNames.includes(p.name)) : packDirs;

  const tasks = new Listr(
    packs
      .filter((packDir) => packDir.isDirectory())
      .map((packDir) => {
        return {
          task: async (_, task) => {
            task.title = `Extracting ${packDir.name}`;
            const packResult = await extractPack(packDir.name, options);
            const yellowSign = pc.yellow("\u26a0");
            const redSign = pc.red("\u26a0");
            const notifications = [];

            if (packResult.addedFiles.length) {
              notifications.push(
                `${pc.green("\u26a0")} Added ${pc.bold(packResult.addedFiles.length)} files:`,
              );
              const addedFiles = packResult.addedFiles.map((f) => path.basename(f)).join(", ");
              notifications.push(`${pc.dim(addedFiles)}`);
            }

            if (packResult.removedFiles.length) {
              if (options.reset) {
                notifications.push(
                  `${yellowSign} Removed ${pc.bold(
                    packResult.removedFiles.length,
                  )} files without DB entry:`,
                );
              } else {
                notifications.push(
                  `${yellowSign} Found ${pc.bold(
                    packResult.removedFiles.length,
                  )} files without DB entry:`,
                );
              }
              const removedFiles = packResult.removedFiles.map((f) => path.basename(f)).join(", ");
              notifications.push(`${pc.dim(removedFiles)}`);
            }

            const conflictsNumber = Object.keys(packResult.conflicts).length;
            if (conflictsNumber) {
              notifications.push(`${redSign} Found ${pc.bold(conflictsNumber)} ID conflicts:`);
              for (const [id, files] of Object.entries(packResult.conflicts)) {
                notifications.push(
                  pc.dim(`${id} in ${pc.dim([...files].map((f) => path.basename(f)).join(", "))}`),
                );
              }
            }

            if (notifications.length) {
              task.title = `Extracted ${packDir.name} with notifications:\n${notifications.join(
                `\n`,
              )}`;
            } else {
              task.title = `Extracted ${packDir.name}`;
            }
          },
        };
      }),
    { concurrent: true },
  );
  return tasks.run();
}

/**
 * Compiles all directories in {@link PACK_SRC} into dbs in {@link PACK_CACHE}
 *
 * @returns {Promise<void>}
 */
async function compileAllPacks() {
  await fs.ensureDir(resolveCache());
  await Promise.all(
    (await fs.readdir(resolveCache())).map(async (f) => fs.remove(resolveCache(f))),
  );
  const dirs = (await fs.readdir(resolveSource(), { withFileTypes: true })).filter((f) =>
    f.isDirectory(),
  );
  return Promise.all(dirs.map((d) => d.name).map((d) => compilePack(d)));
}

/**
 * Compiles a directory containing yaml files into a leveldb
 * with the directory's name in {@link PACK_CACHE}
 *
 * @param {string} name - Name of the db
 * @returns {Promise<void>}
 */
async function compilePack(name) {
  console.info(`Creating pack ${resolveCache(name)}`);
  await fs.remove(`${resolveCache(name)}`);
  return fvtt.compilePack(resolveSource(name), resolveCache(name), { yaml: true });
}
