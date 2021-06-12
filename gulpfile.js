const esbuild = require("esbuild");
const argv = require("yargs").argv;
const chalk = require("chalk");
const fs = require("fs-extra");
const gulp = require("gulp");
const path = require("path");
const semver = require("semver");
const sass = require("@mr-hope/gulp-sass").sass;
const git = require("gulp-git");

// Compendium tasks
const Datastore = require("nedb");
const { Transform } = require("stream");
const mergeStream = require("merge-stream");

// BrowserSync for reloads
const browserSync = require("browser-sync").create();

/********************/
/*  CONFIGURATION   */
/********************/

const name = path.basename(path.resolve("."));
const sourceDirectory = "./src";
const distDirectory = "./dist";
const stylesDirectory = `${sourceDirectory}/styles`;
const stylesExtension = "scss";
const sourceFileExtension = "ts";
const staticFiles = ["assets", "fonts", "lang", "templates", "module.json"];
const getDownloadURL = (version) =>
  `https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/-/jobs/artifacts/${version}/raw/pf1spheres.zip?job=build`;
const PACK_SRC = "src/packs";
const PACK_DEST = "packs";

/********************/
/*      BUILD       */
/********************/

/**
 * Build the distributable JavaScript code
 */
async function buildCode() {
  return esbuild.build({
    entryPoints: ["./src/module/pf1spheres.ts"],
    bundle: true,
    outfile: `${distDirectory}/pf1spheres.js`,
    sourcemap: true,
    sourceRoot: "pf1spheres",
    minify: false,
    format: "esm",
    platform: "browser",
  });
}

/**
 * Build style sheets
 */
function buildStyles() {
  return gulp
    .src(`${stylesDirectory}/${name}.${stylesExtension}`)
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest(`${distDirectory}/styles`))
    .pipe(browserSync.stream());
}

/**
 * Copy static files
 */
async function copyFiles() {
  for (const file of staticFiles) {
    if (fs.existsSync(`${sourceDirectory}/${file}`)) {
      await fs.copy(`${sourceDirectory}/${file}`, `${distDirectory}/${file}`);
    }
  }
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
    gulp.series(buildCode, reload)
  );
  gulp.watch(`${stylesDirectory}/**/*.${stylesExtension}`, { ignoreInitial: false }, buildStyles);
  gulp.watch(
    staticFiles.map((file) => `${sourceDirectory}/${file}`),
    { ignoreInitial: false },
    copyFiles
  );
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
/*    VERSIONING    */
/********************/

/**
 * Get the contents of the manifest file as object.
 */
function getManifest() {
  const manifestPath = `${sourceDirectory}/module.json`;

  if (fs.existsSync(manifestPath)) {
    return {
      file: fs.readJSONSync(manifestPath),
      name: "module.json",
    };
  }
}

/**
 * Get the target version based on on the current version and the argument passed as release.
 */
function getTargetVersion(currentVersion, release) {
  if (
    ["major", "premajor", "minor", "preminor", "patch", "prepatch", "prerelease"].includes(release)
  ) {
    return semver.inc(currentVersion, release);
  } else {
    return semver.valid(release);
  }
}

/**
 * Update version and download URL.
 */
function bumpVersion(cb) {
  const packageJson = fs.readJSONSync("package.json");
  const packageLockJson = fs.existsSync("package-lock.json")
    ? fs.readJSONSync("package-lock.json")
    : undefined;
  const manifest = getManifest();

  if (!manifest) cb(Error(chalk.red("Manifest JSON not found")));

  try {
    const release = argv.release || argv.r;

    const currentVersion = packageJson.version;

    if (!release) {
      return cb(Error("Missing release type"));
    }

    const targetVersion = getTargetVersion(currentVersion, release);

    if (!targetVersion) {
      return cb(new Error(chalk.red("Error: Incorrect version arguments")));
    }

    if (targetVersion === currentVersion) {
      return cb(new Error(chalk.red("Error: Target version is identical to current version")));
    }

    console.log(`Updating version number to '${targetVersion}'`);

    packageJson.version = targetVersion;
    fs.writeJSONSync("package.json", packageJson, { spaces: 2 });

    if (packageLockJson) {
      packageLockJson.version = targetVersion;
      fs.writeJSONSync("package-lock.json", packageLockJson, { spaces: 2 });
    }

    manifest.file.version = targetVersion;
    manifest.file.download = getDownloadURL(targetVersion);
    fs.writeJSONSync(`${sourceDirectory}/${manifest.name}`, manifest.file, { spaces: 2 });

    return gulp
      .src(`${sourceDirectory}/module.json`)
      .pipe(git.commit(`Release ${targetVersion}`))
      .pipe(git.tag(`${targetVersion}`));
  } catch (err) {
    cb(err);
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
      if (!fs.existsSync(`./${PACK_SRC}/${filename}`)) {
        fs.mkdirSync(`./${PACK_SRC}/${filename}`);
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

const execBuild = gulp.parallel(buildCode, buildStyles, copyFiles);

exports.build = gulp.series(clean, execBuild);
exports.watch = buildWatch;
exports.clean = clean;
exports.link = linkUserData;
exports.bumpVersion = bumpVersion;

exports.compilePacks = gulp.series(cleanPacks, compilePacks);
exports.extractPacks = extractPacks;
