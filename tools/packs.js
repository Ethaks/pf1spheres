/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import Datastore from "@seald-io/nedb";
import fs from "fs-extra";
import path from "node:path";
import yargs from "yargs";

const PACK_SRC = "../src/packs";
const PACK_CACHE = "../public/packs";

const __dirname = new URL(".", import.meta.url).pathname;

/** Helper function that resolves a path from the pack source directory */
const resolveSource = (...file) => path.resolve(__dirname, PACK_SRC, ...file);
/** Helper function that resolves a path from the pack cache directory */
const resolveCache = (...file) => path.resolve(__dirname, PACK_CACHE, ...file);
/** Helper function that resolves a path from the pack destination directory */
const resolveDist = (...file) => path.resolve(__dirname, "../dist/packs", ...file);

yargs(process.argv.slice(2))
  .demandCommand(1, 1)
  .command("extract", `Extract packs from cache to source`, async (argv) => {
    extractAllPacks({
      reset: !argv.keepDeleted ?? true,
      keepIds: !argv.resetIds ?? true,
    });
  })
  // Option to overwrite the default `reset` option
  .option("keepDeleted", { alias: "k", type: "boolean" })
  // Option to overwrite the default `keepIds` option
  .option("resetIds", { alias: "r", type: "boolean" })
  .command("compile", `Compile json files from source into db files in cache`, async () => {
    compileAllPacks();
  }).argv;

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
function sanitizePack(entry) {
  // Reset permissions to default
  delete entry.permission;
  entry.ownership = { default: 0 };

  if (entry._stats) {
    entry._stats.lastModifiedBy = "pf1spheres-db000";
  }
  // Remove non-system/non-core flags
  for (const key of Object.keys(entry.flags)) {
    if (!["pf1", "pf1spheres"].includes(key)) delete entry.flags[key];
  }
  return entry;
}

/**
 * @typedef {object} PackOptions
 * @property {boolean} keepIds Whether existing IDs are to be kept, regardless of db ids
 * @property {boolean} reset Whether entries not in the db file are to be deleted
 */

/**
 * Extracts a single db file, creating a directory with the file's name in {@link PACK_SRC},
 * and storing each db entry in its own file.
 *
 * @param {string} filename - The db file name from {@link PACK_CACHE}
 * @param {PackOptions} options - Additional options modifying the extraction process
 */
async function extractPack(filename, options) {
  // This db files directory in PACK_SRC
  const directory = resolveSource(path.basename(filename, ".db"));
  const db = new Datastore({ filename: resolveDist(filename), autoload: true });

  console.log(`Extracting pack ${filename}`);

  // Index of already existing files, to be checked for files not touched with this extraction
  const currentFiles = [];

  if (!fs.existsSync(directory)) {
    await fs.mkdir(directory);
  } else if (options.reset) {
    for (const curFile of fs.readdirSync(directory)) {
      currentFiles.push(resolveSource(directory, curFile));
    }
  }
  const docs = await db.findAsync({});
  const docPromises = docs.map(async (doc) => {
    doc = sanitizePack(doc);

    const entryFilepath = resolveSource(directory, `${sluggify(doc.name)}.json`);

    if (options.keepIds) {
      try {
        const prev = fs.readJsonSync(entryFilepath);
        if (prev?._id) doc._id = prev._id;
      } catch (_) {}
    }

    await fs.writeJson(entryFilepath, doc, { spaces: 2 });
    return entryFilepath;
  });
  const writtenFiles = await Promise.all(docPromises);

  const removedFiles = options.reset
    ? await Promise.all(
        currentFiles
          .filter((f) => !writtenFiles.includes(f))
          .map(async (f) => {
            await fs.remove(f);
            return f;
          }),
      )
    : [];

  return { writtenFiles, removedFiles };
}

/**
 * Extracts all db files from {@link PACK_CACHE} into {@link PACK_SRC}
 *
 * @param {PackOptions} options - Additional options modifying the extraction process
 */
async function extractAllPacks(options) {
  const packs = await fs.readdir(resolveDist(), { withFileTypes: true });
  return Promise.all(
    packs
      .filter((p) => p.isFile() && path.extname(p.name) === ".db")
      .map((p) => extractPack(p.name, options)),
  );
}

/**
 * Compiles a directory containing json files into a single db file
 * with the directory's name in {@link PACK_CACHE}
 *
 * @param {string} name - Name of the db file
 */
async function compilePack(name) {
  console.log(`Creating pack ${resolveCache(name)}.db`);
  await fs.remove(`${resolveCache(name)}.db`);
  const db = new Datastore({ filename: `${resolveCache(name)}.db`, autoload: true });
  const files = (await fs.readdir(resolveSource(name))).filter((f) => path.extname(f) === ".json");
  await Promise.all(
    files.map(async (f) => {
      const json = await fs.readJson(resolveSource(name, f));
      try {
        await db.insertAsync(json);
      } catch (error) {
        console.error(`Could not insert entry ${json.name} with id ${json.id}\n`, error);
      }
    }),
  );
  db.compactDatafile();
}

/**
 * Compiles all directories in {@link PACK_SRC} into db files in {@link PACK_CACHE}
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
