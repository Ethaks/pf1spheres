import type { ItemDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import type { JournalEntryDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/journalEntryData";
import type { SaveProgression } from "../item-data";

import * as t from "io-ts";
//import * as E from "fp-ts/Either";
import type { BABProgression, Sphere } from "../item-data";
import { getAllSpheres } from "../item-util";

export interface BasePackConfig<T extends RawData, D extends ConstructorData> {
  docType: "Item" | "JournalEntry";
  fileNames: [string];
  packNames: string[];
  /**
   * A function that returns one of this config's {@link BasePackConfig.packNames} to which an individual document belongs.
   * Mandatory if there is more than one pack!
   */
  orderByFunction?: (entry: D) => string | undefined;
  /**
   * A function transforming source data into Foundry-conforming shape,
   * or undefined if data is to be dropped or no viable data could be extracted
   */
  transformFunction: TransformFunction<T, D>;
  /** An array of functions working with a whole array of raw data instead of single elements */
  collectionFunctions?: CollectionFunction[];
  /**
   * Collects {@link DeduplicationData} used thoughout a deduplication process belonging to an entry.
   *
   * @param data - A single data entry
   * @returns Data relevant to this data entry
   */
  deduplicationDataGetter?: (data: T) => DeduplicationData;
}

/** Additional options affecting an import process */
export interface DataImportOptions {
  /** Create new documents */
  create?: boolean;
  /** Update existing documents (determined by name) */
  update?: boolean;
  /** Delete all documents before importing */
  reset?: boolean;
}

export type ConstructorData = ItemDataConstructorData | JournalEntryDataConstructorData;

/** The minimum data common to all raw data objects */
type RawDataBase = t.TypeOf<typeof RawDataBase>;
const RawDataBase = t.type({
  name: t.string,
  text: t.string,
});

export type RawItemData = RawClassData | RawTalentData | RawFeatData | RawAbilityData;
export type RawData = RawItemData | RawTocData;

type SphereFromString = t.TypeOf<typeof SphereFromString>;
const SphereFromString = new t.Type(
  "SphereFromString",
  (s): s is Sphere => typeof s === "string" && s in getAllSpheres(),
  (sphere, c) => {
    if (typeof sphere !== "string") return t.failure(sphere, c);
    const sphereNames = Object.keys(getAllSpheres());
    const slugSphereName = sphere.slugify();
    if (sphereNames.includes(slugSphereName as Sphere)) return t.success(sphere as Sphere);
    const guess = sphereNames.find((n) => n.startsWith(slugSphereName.split("-")[0]));
    if (guess) return t.success(sphere as Sphere);
    else return t.failure(sphere, c);
  },
  t.identity
);

export type RawTalentData = t.TypeOf<typeof RawDataTalent>;
const RawDataTalent = t.intersection([
  RawDataBase,
  t.type({ tags: t.array(t.string), sphere: SphereFromString }),
]);

export type RawFeatData = t.TypeOf<typeof RawFeatData>;
const RawFeatData = t.intersection([RawDataBase, t.type({ tags: t.array(t.string) })]);

type BabProgressionFromString = t.TypeOf<typeof BabProgressionFromString>;
const BabProgressionFromString = new t.Type(
  "BabProgressionFromString",
  (s): s is BABProgression => typeof s === "string" && ["high", "med", "low"].includes(s),
  (s, c) => {
    if (typeof s !== "string") return t.failure(s, c);
    const progressions = ["high", "med", "low"];
    if (progressions.includes(s)) return t.success(s as BABProgression);
    const guess = guessProgressionFromLetter(progressions, s);
    if (guess) return t.success(guess as BABProgression);
    return t.failure(s, c);
  },
  t.identity
);

const guessProgressionFromLetter = (progressions: string[], value: string) =>
  progressions.find((p) => p.charAt(0) === value.charAt(0));

export type SaveProgressionFromString = t.TypeOf<typeof SaveProgressionFromString>;
const SaveProgressionFromString = new t.Type(
  "SaveProgressionFromString",
  (p): p is SaveProgression => typeof p === "string" && ["high", "low"].includes(p),
  (p, c) =>
    typeof p === "string" && ["high", "low"].includes(p)
      ? t.success(p as SaveProgression)
      : t.failure(p, c),
  t.identity
);

export type SaveDataRecord = t.TypeOf<typeof SaveDataRecord>;
const SaveDataRecord = t.type({
  fort: SaveProgressionFromString,
  ref: SaveProgressionFromString,
  will: SaveProgressionFromString,
});

export type RawClassData = t.TypeOf<typeof RawClassData>;
const RawClassData = t.intersection([
  RawDataBase,
  t.type({
    bab: BabProgressionFromString,
    hd: t.number,
    hp: t.number,
    savingThrows: SaveDataRecord,
    classSkills: t.array(t.string),
    links: t.array(t.type({ name: t.string, level: t.number })),
    armorProf: t.array(t.tuple([t.string])),
    weaponProf: t.array(t.tuple([t.string])),
    skillsPerLevel: t.number,
  }),
]);

export type RawAbilityData = t.TypeOf<typeof RawAbilityData>;
const RawAbilityData = t.intersection([
  RawDataBase,
  t.type({
    type: t.keyof({ classFeat: null }),
    class: t.string,
    sub_abilities: t.array(t.string),
  }),
]);

export type RawTocData = t.TypeOf<typeof RawTocData>;
const RawTocData = t.intersection([RawDataBase, t.type({ toc: t.string })]);

export type HomogeneousArray<T> = T extends unknown ? T[] : never;
export type RawDataJson = HomogeneousArray<RawData>;
export type CollectionFunction = <T>(dataJson: T[]) => T[];
export type TransformFunction<T, D> = (entry: T) => D | undefined;

/** Various strings used to determine whether something is a duplicate, and how it should be named */
export interface DeduplicationData {
  /** Value of the primary property used to determine whether elements should be pruned/renamed */
  prop: string;
  /** A string appended to the entry's name to avoid multiple entries with the same name in one pack */
  suffix: string;
  /** ID used to determine whether two entries are actual duplicates or only naming conflicts*/
  longId?: string;
  /** ID used to determine whether entries would conflict within the same pack */
  shortId: string;
}
