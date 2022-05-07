/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { ConfiguredDocumentClassForName } from "@league-of-foundry-developers/foundry-vtt-types/src/types/helperTypes";

import type {
  AllowedImportConstructorData,
  AllowedImportDocumentNames,
  BasePackConfig,
  DataImportOptions,
  DeduplicationData,
  ImportReturnValue,
  RawData,
} from "./pack-util-data";
import { nonNullable } from "../ts-util";
import { getGame } from "../util";

import type * as t from "io-ts";
import { failure } from "io-ts/PathReporter";
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";

/**
 * Imports data according to a preconfigured config entry or a given config object.
 *
 * @async
 * @param config - The config used for the import
 * @param [options] - Additional options affecting the import process
 * @returns Objects containing a pack reference and the items created therein
 */
export async function importData<
  T extends RawData,
  DT extends AllowedImportDocumentNames,
  D extends AllowedImportConstructorData
>(
  config: BasePackConfig<T, DT, D>,
  options: DataImportOptions = {}
): Promise<ImportReturnValue<DT>[]> {
  const { create = true, update = true, reset = false } = options;

  const packs = await ensurePacks(config.packNames);
  const rawData = await fetchData(config.decoder)(config.fileNames);

  const dedupedData =
    "deduplicationDataGetter" in config
      ? deduplicateData(config.deduplicationDataGetter)(rawData)
      : rawData;

  // Type assertions necessary for TS to recognise that the end result will not be a function
  const dataAfterExtraTreatment: T[] =
    "collectionFunctions" in config
      ? (config.collectionFunctions?.reduce((acc, fn) => fn(acc as T[]), dedupedData) as T[])
      : rawData;

  const transformedData: DeepPartial<D>[] = dataAfterExtraTreatment
    .map((t: T) => config.transformFunction(t))
    .filter(nonNullable);

  // Record in which each evential pack gets its own index
  const sortedData = Object.values(packs).reduce((acc, pack) => {
    acc[pack.metadata.name] = { pack, data: [] };
    return acc;
  }, {} as Record<string, { pack: typeof packs[number]; data: DeepPartial<D>[] }>);

  // There's only one pack to create, so no sorting to determine target pack necessary
  if (packs.length < 2) sortedData[packs[0].metadata.name].data = transformedData;
  else {
    if (!("orderByFunction" in config))
      throw new Error("Importing data into multiple packs requires a sortFunction!");
    for (const entry of transformedData) {
      // Determine target pack, push to data array for that pack
      const targetPack = config.orderByFunction(entry);
      if (targetPack !== undefined) sortedData[targetPack].data.push(entry);
    }
  }

  // Creation and update workflow dependent on destination pack
  const packPromises = Object.values(sortedData).map(async (packData) => {
    const { pack } = packData;
    const packName = pack.collection;
    let docs = await packData.pack.getDocuments();

    // Optionally clear out pack beforehand
    if (reset) {
      await packData.pack.documentClass.deleteDocuments(
        docs.map((d) => d.id),
        { pack: packName }
      );
      docs = [];
    }

    const createData: DeepPartial<D>[] = [];
    const updateData: DeepPartial<D>[] = [];

    // Determine whether document already exists and store accordingly
    for (const entry of packData.data) {
      const existingDocument = docs.find((doc) => doc.name === entry.name);
      if (existingDocument) {
        if (update) updateData.push({ ...entry, _id: existingDocument.id });
      } else {
        if (create) createData.push(entry);
      }
    }

    const result: ImportReturnValue<DT> = {
      created: [],
      updated: [],
    };

    if (create) {
      // @ts-expect-error Typescript cannot determine data type
      const createdDocuments = await getDocumentClass(config.docType).createDocuments(createData, {
        pack: packName,
      });
      result.created = createdDocuments;
    }

    if (update) {
      // @ts-expect-error Typescript cannot determine data type
      const updatedItems = await getDocumentClass(config.docType).updateDocuments(updateData, {
        pack: packName,
      });
      result.updated = updatedItems as StoredDocument<
        ConfiguredDocumentClassForName<DT>["prototype"]
      >[];
    }

    return result;
  });

  return Promise.all(packPromises);
}

/**
 * Ensures that packs exist and can be written to.
 *
 * @async
 * @param packLabels - Labels of packs to be checked/created/unlocked
 * @throws {Error} - If no pack with that name could be found – Foundry creates packs according to the module's manifest
 * @returns An array of packs
 */
async function ensurePacks(
  packLabels: string[]
): Promise<CompendiumCollection<CompendiumCollection.Metadata>[]> {
  const packs = [];
  for (const packName of packLabels) {
    const pack = getGame().packs.get(`pf1spheres.${packName.slugify()}`);
    if (pack === undefined)
      throw new Error(`Pack ${packName} with name ${packName.slugify()} could not be found!`);
    if (pack.locked) await pack.configure({ locked: false });
    packs.push(pack);
  }
  return packs;
}

/**
 * Returns a function that fetches files from the server and decodes their contents with
 * the decoder given to this function.
 *
 * @param decoder - Decoder to be used
 */
const fetchData =
  <T extends RawData>(decoder: t.Decoder<unknown, T>) =>
  /**
   * Fetch one or multiple JSON files and read them into JS objects.
   *
   * @async
   * @param fileNames - File names of files to be fetched
   * @returns An array of raw data read from JSON files
   */
  async (fileNames: string[]): Promise<T[]> => {
    const filePromises = fileNames.map(async (fileName) => {
      const file = await fetch(`modules/pf1spheres/raw-packs/${fileName}`);
      const fileJson = await file.json();
      return fileJson;
    });
    const jsons = (await Promise.all(filePromises)).flat();
    return jsons.map(decode(decoder)).filter(nonNullable);
  };

/**
 * Returns a function that decodes data according to this function's {@link codec} parameter.
 *
 * @param codec - Codec used to decode/validata data
 */
const decode =
  <I, A>(codec: t.Decoder<I, A>) =>
  /**
   * Decodes raw data of unknown format, either returning {@link undefined} or the validated data object.
   *
   * @param json - Unvalidated data object
   */
  (json: I): A | undefined =>
    pipe(
      codec.decode(json),
      E.getOrElse<t.Errors, A | undefined>((errors) => {
        console.error(failure(errors).join("\n"));
        return undefined;
      })
    );

/**
 * Returns a function that, given a function that returns an entry's {@link DeduplicationData}, deduplicates a whole data set
 *
 * @param dataGetter - A function returning an entry's {@link DeduplicationData}
 */
export const deduplicateData =
  <T extends RawData>(dataGetter: (t: T) => DeduplicationData | undefined) =>
  /**
   * Discovers duplicates and naming conflicts, solving the latter by adjusting entries' names
   *
   * @param dataJson - An array of raw data to be checked
   * @returns An array of data, hopefully free from duplicates and naming conflicts
   */
  (dataJson: T[]) => {
    const unhandledData: T[] = [];
    const itemArraysByName = [...dataJson].reduce((acc, item) => {
      const dedupeData = dataGetter(item);
      if (dedupeData === undefined) {
        unhandledData.push(item);
      } else {
        (acc[dedupeData.shortId] || (acc[dedupeData.shortId] = [])).push({ item, dedupeData });
      }
      return acc;
    }, {} as Record<string, Array<{ item: T; dedupeData: DeduplicationData }>>);

    // Save dupes for logging
    const dupes: unknown[] = [];
    const newData = Object.values(itemArraysByName).flatMap((dataArray) => {
      // More than one element with same name
      if (dataArray.length > 1) {
        // Use Map to drop complete duplicates
        const map = new Map(
          // Use longId to enable multple raw data entries with the same name ultimately belonging to different packs
          dataArray.map((itemData) => [
            itemData.dedupeData.longId ?? itemData.dedupeData.shortId,
            itemData,
          ])
        );
        if (map.size !== dataArray.length) {
          // Actual duplicates found, return the winner of the Map creation process
          dupes.push(dataArray);
          if (map.size === 1) return [...map.values()].map((d) => d.item);
        }
        // Multiple conflicting entries, add suffix to ensure unique file names after pack extraction
        return [...map.values()].map((item) => {
          item.item.name = `${item.item.name} (${item.dedupeData.suffix})`;
          return item.item;
        });
      } else return dataArray.map((d) => d.item); // Element's name is unique
    });
    console.warn("Duplicates: ", dupes);
    return [...unhandledData, ...newData] as T[];
  };
