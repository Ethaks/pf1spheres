// SPDX-FileCopyrightText: 2021 Johannes Loher
// SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
//
// SPDX-License-Identifier: MIT

const esbuild = require("esbuild");
const argv = require("yargs").argv;
const chalk = require("chalk");
const fs = require("fs-extra");
const gulp = require("gulp");
const path = require("path");
const sass = require("@mr-hope/gulp-sass").sass;
const sourcemaps = require("gulp-sourcemaps");

// Compendium tasks
const Datastore = require("nedb");
const { Transform } = require("stream");
const mergeStream = require("merge-stream");

// BrowserSync for reloads
const browserSync = require("browser-sync").create();

/********************/
/*  CONFIGURATION   */
/********************/

const name = "pf1spheres";
const sourceDirectory = "./src";
const entryFile = `${sourceDirectory}/module/${name}.ts`;
const distDirectory = "./dist";
const stylesDirectory = `${sourceDirectory}/styles`;
const stylesExtension = "scss";
const sourceFileExtension = "ts";
const staticFiles = [
  "assets",
  "fonts",
  "lang",
  "templates",
  "CREDITS.md",
  "LICENSE",
  "LICENSES",
  ".reuse",
];
const manifest = `${sourceDirectory}/module.json`;
const PACK_SRC = `${sourceDirectory}/packs`;
const PACK_DEST = "packs";

/********************/
/*      BUILD       */
/********************/

/** @type {esbuild.BuildResult|undefined} */
let buildResult;

/**
 * Build the distributable JavaScript code
 */
async function buildCode(isProductionBuild = false) {
  return buildResult === undefined
    ? (buildResult = await esbuild.build({
        entryPoints: [entryFile],
        bundle: true,
        outfile: `${distDirectory}/${name}.js`,
        sourcemap: true,
        sourceRoot: name,
        minifySyntax: isProductionBuild,
        minifyWhitespace: isProductionBuild,
        keepNames: true,
        format: "esm",
        platform: "browser",
        incremental: !isProductionBuild,
      }))
    : buildResult.rebuild();
}

/** Build JS for development */
function buildDevelopment() {
  return buildCode(false);
}

/** Build JS for production */
function buildProduction() {
  return buildCode(true);
}

/**
 * Build style sheets
 */
function buildStyles() {
  return gulp
    .src(`${stylesDirectory}/${name}.${stylesExtension}`)
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(`${distDirectory}/styles`))
    .pipe(browserSync.stream());
}

/**
 * Copy static files
 */
async function copyFiles() {
  for (const file of staticFiles) {
    if (fs.existsSync(file)) {
      await fs.copy(file, `${distDirectory}/${file}`);
    }
  }

  // Copy manifest seperately to avoid placement in dist/src
  await fs.copyFile(manifest, `${distDirectory}/module.json`);
}

/**
 * Copy pack files from root to desitnation
 */
async function copyPacks() {
  await fs.copy(PACK_DEST, `${distDirectory}/packs`);
}

/**
 * Initialises browserSync
 */
function serve() {
  browserSync.init({
    server: false,
    open: false,
    proxy: {
      target: "localhost:30000",
      ws: true,
      proxyOptions: {
        changeOrigin: false,
      },
    },
  });
}

/**
 * Reloads browsers using browserSync's proxy
 */
function reload(cb) {
  browserSync.reload();
  cb();
}

/**
 * Watch for changes for each build step
 */
function buildWatch() {
  serve();
  gulp.watch(
    `${sourceDirectory}/**/*.${sourceFileExtension}`,
    { ignoreInitial: false },
    gulp.series(buildDevelopment, reload)
  );
  gulp.watch(`${stylesDirectory}/**/*.${stylesExtension}`, { ignoreInitial: false }, buildStyles);
  gulp.watch(staticFiles, { ignoreInitial: false }, copyFiles);
  gulp.watch("packs", { ignoreInitial: false }, copyPacks);
}

/********************/
/*      CLEAN       */
/********************/

/**
 * Remove built files from `dist` folder while ignoring source files
 */
async function clean() {
  const files = [...staticFiles, "module", "packs"];

  if (fs.existsSync(`${stylesDirectory}/${name}.${stylesExtension}`)) {
    files.push("styles");
  }

  console.log(" ", chalk.yellow("Files to clean:"));
  console.log("   ", chalk.blueBright(files.join("\n    ")));

  for (const filePath of files) {
    await fs.remove(`${distDirectory}/${filePath}`);
  }
}

/********************/
/*       LINK       */
/********************/

/**
 * Get the data path of Foundry VTT based on what is configured in `foundryconfig.json`
 */
function getDataPath() {
  const config = fs.readJSONSync("foundryconfig.json");

  if (config?.dataPath) {
    if (!fs.existsSync(path.resolve(config.dataPath))) {
      throw new Error("User Data path invalid, no Data directory found");
    }

    return path.resolve(config.dataPath);
  } else {
    throw new Error("No User Data path defined in foundryconfig.json");
  }
}

/**
 * Link build to User Data folder
 */
async function linkUserData() {
  let destinationDirectory;
  if (fs.existsSync(path.resolve(sourceDirectory, "module.json"))) {
    destinationDirectory = "modules";
  } else {
    throw new Error(`Could not find ${chalk.blueBright("module.json")}`);
  }

  const linkDirectory = path.resolve(getDataPath(), destinationDirectory, name);

  if (argv.clean || argv.c) {
    console.log(chalk.yellow(`Removing build in ${chalk.blueBright(linkDirectory)}.`));

    await fs.remove(linkDirectory);
  } else if (!fs.existsSync(linkDirectory)) {
    console.log(chalk.green(`Linking dist to ${chalk.blueBright(linkDirectory)}.`));
    await fs.ensureDir(path.resolve(linkDirectory, ".."));
    await fs.symlink(path.resolve(distDirectory), linkDirectory);
  }
}

/********************/
/*  PACK HANDLING   */
/********************/

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
 * Santize pack entries.
 *
 * This resets the entries' permissions to defaul and removes all non-pf1(spheres) flags.
 *
 * @param {object} pack Loaded compendium content.
 * @returns {object} The sanitized content.
 */
function sanitizePack(pack) {
  // Reset permissions to default
  pack.permission = { default: 0 };
  // Remove non-system/non-core flags
  for (const key of Object.keys(pack.flags)) {
    if (!["pf1", "pf1spheres"].includes(key)) delete pack.flags[key];
  }
  return pack;
}

/**
 * Extract pack entries from DBs and into single files
 *
 * @returns {NodeJS.ReadableStream} The merged ReadableStream
 */
function extractPacks() {
  const extract = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform(file, _, callback) {
      // Create directory.
      let filename = path.parse(file.path).name;
      if (!fs.existsSync(`${PACK_SRC}/${filename}`)) {
        fs.mkdirSync(`${PACK_SRC}/${filename}`);
      }

      // Load the database.
      const db = new Datastore({ filename: file.path, autoload: true });
      db.loadDatabase();

      db.persistence.compactDatafile();
      db.on("compaction.done", () => {
        // Export the packs.
        db.find({}, (_, packs) => {
          // Iterate through each compendium entry.
          packs.forEach((pack) => {
            // Remove permissions and _id
            pack = sanitizePack(pack);

            let output = JSON.stringify(pack, null, 2);

            // Sluggify the filename.
            let packName = sluggify(pack.name);

            // Write to the file system.
            fs.writeFileSync(
              path.resolve(__dirname, PACK_SRC, filename, `${packName}.json`),
              output
            );
          });
        });
      });

      // Complete the callback.
      callback(null, file);
    },
  });

  // Start a stream for all db files in the packs dir.
  const packs = gulp
    .src(`${PACK_DEST}/**/*.db`)
    // Run a callback on each pack file to load it and then write its
    // contents to the pack src dir.
    .pipe(extract);

  // Merge the streams.
  return mergeStream.call(null, packs);
}

/**
 * Compiles all json files into db packs
 *
 * @returns {NodeJS.ReadableStream} The pack name stream
 */
function compilePacks() {
  // Every folder in the src dir will become a compendium.
  const folders = fs.readdirSync(PACK_SRC).filter((file) => {
    return fs.statSync(path.join(PACK_SRC, file)).isDirectory();
  });

  // Iterate over each folder/compendium.
  const packs = folders.map((folder) => {
    // Initialize a blank nedb database based on the directory name. The new
    // database will be stored in the dest directory as <foldername>.db
    const db = new Datastore({
      filename: path.resolve(__dirname, PACK_DEST, `${folder}.db`),
      autoload: true,
    });
    // Process the folder contents and insert them in the database.
    const compile = new Transform({
      readableObjectMode: true,
      writableObjectMode: true,
      transform(file, _, callback) {
        let json = JSON.parse(file.contents.toString());
        db.insert(json);

        // Complete the callback.
        callback(null, file);
      },
    });
    return gulp.src(path.join(PACK_SRC, folder, "/**/*.json")).pipe(compile);
  });

  // Merge the streams.
  return mergeStream.call(null, packs);
}

/**
 * Deletes all compiled packs
 */
async function cleanPacks() {
  return fs.remove(PACK_DEST);
}

// TASKS

const execBuild = gulp.parallel(
  buildProduction,
  buildStyles,
  copyFiles,
  gulp.series(cleanPacks, compilePacks, copyPacks)
);

exports.build = gulp.series(clean, execBuild);
exports.watch = buildWatch;
exports.clean = clean;
exports.link = linkUserData;

exports.compilePacks = gulp.series(cleanPacks, compilePacks);
exports.extractPacks = extractPacks;
