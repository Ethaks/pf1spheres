/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type {
  ItemDataConstructorData,
  ItemDataSource,
} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import type {
  JournalEntryDataConstructorData,
  JournalEntryDataSource,
} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/journalEntryData";
import type { ConfiguredDocumentClassForName } from "@league-of-foundry-developers/foundry-vtt-types/src/types/helperTypes";

import type { SaveProgression } from "../item-data";
import type { BABProgression, Sphere } from "../item-data";
import { getAllSpheres } from "../item-util";

import * as t from "io-ts";

export interface BasePackConfig<
  T extends RawData,
  DT extends AllowedImportDocumentNames,
  D extends AllowedImportConstructorData
> {
  /** The {@link DocumentType} of the documents to be created */
  docType: DT;
  /** An array of file names to be fetched for source data retrieval */
  fileNames: string[];
  /** An array containing pack names (i.e. display names) into which data is to be imported */
  packNames: string[];
  /**
   * A function that returns one of this config's {@link BasePackConfig.packNames} to which an individual document belongs.
   * Mandatory if there is more than one pack!
   */
  orderByFunction?: (entry: DeepPartial<D>) => string | undefined;
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
  /**
   * A {@link t.Decoder} that decodes and validates raw data from json files to ensure all
   * fields presumed to be present are of the right type
   */
  decoder: t.Decoder<unknown, T>;
}

export type AllowedImportDocumentNames = "Item" | "JournalEntry";
export type AllowedImportConstructorData = ItemDataSource | JournalEntryDataSource;

export interface ImportReturnValue<DT extends AllowedImportDocumentNames> {
  created: StoredDocument<ConfiguredDocumentClassForName<DT>["prototype"]>[];
  updated: StoredDocument<ConfiguredDocumentClassForName<DT>["prototype"]>[];
}

/** Additional options affecting an import process */
export interface DataImportOptions {
  /** Create new documents */
  create?: boolean;
  /** Update existing documents (determined by name) */
  update?: boolean;
  /** Delete all documents before importing */
  reset?: boolean;
  /** An additional context provided to the transform function */
  context?: Record<string, unknown>;
}

export type ConstructorData = ItemDataConstructorData | JournalEntryDataConstructorData;

/** The minimum data common to all raw data objects */
export type RawDataBase = t.TypeOf<typeof RawDataBase>;
export const RawDataBase = t.type({
  name: t.string,
  text: t.string,
});

export type RawItemData = RawClassData | RawTalentData | RawFeatData | RawAbilityData;
export type RawData = RawItemData | RawSphereJournalData;

type SphereFromString = t.TypeOf<typeof SphereFromString>;
const SphereFromString = new t.Type(
  "SphereFromString",
  (s): s is Sphere => typeof s === "string" && s in getAllSpheres(),
  (sphere, c) => {
    if (typeof sphere !== "string") return t.failure(sphere, c);
    const sphereNames = Object.keys(getAllSpheres());
    const slugSphereName = sphere.slugify();
    if (sphereNames.includes(slugSphereName as Sphere)) return t.success(sphere as Sphere);
    else {
      const guess = sphereNames.find((n) => n.startsWith(slugSphereName.split("-")[0]));
      if (guess) return t.success(guess);
      else return t.failure(sphere, c);
    }
  },
  t.identity
);

export type RawTalentData = t.TypeOf<typeof RawTalentData>;
export const RawTalentData = t.intersection([
  RawDataBase,
  t.type({ tags: t.array(t.string), sphere: SphereFromString }),
]);

export type RawFeatData = t.TypeOf<typeof RawFeatData>;
export const RawFeatData = t.intersection([RawDataBase, t.type({ tags: t.array(t.string) })]);

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
export const SaveProgressionFromString = new t.Type(
  "SaveProgressionFromString",
  (p): p is SaveProgression => typeof p === "string" && ["high", "low"].includes(p),
  (p, c) =>
    typeof p === "string" && ["high", "low"].includes(p)
      ? t.success(p as SaveProgression)
      : t.failure(p, c),
  t.identity
);

export type SaveDataRecord = t.TypeOf<typeof SaveDataRecord>;
export const SaveDataRecord = t.type({
  fort: SaveProgressionFromString,
  ref: SaveProgressionFromString,
  will: SaveProgressionFromString,
});

export type RawClassData = t.TypeOf<typeof RawClassData>;
export const RawClassData = t.intersection([
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
export const RawAbilityData = t.intersection([
  RawDataBase,
  t.type({
    type: t.keyof({ classFeat: null }),
    class: t.string,
    sub_abilities: t.array(t.string),
  }),
]);

export type RawSphereJournalData = t.TypeOf<typeof RawSphereJournalData>;
export const RawSphereJournalData = t.type({
  name: SphereFromString,
  text: t.string,
  toc: t.string,
});

export type HomogeneousArray<T> = T extends unknown ? T[] : never;
export type RawDataJson = HomogeneousArray<RawData>;
export type CollectionFunction = <T>(dataJson: T[]) => T[];
export type TransformFunction<T, D> = (entry: T) => DeepPartial<D> | undefined;

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
