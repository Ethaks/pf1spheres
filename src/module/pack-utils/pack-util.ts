/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { ItemDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import type { JournalEntryDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/journalEntryData";
import { PF1S } from "../config";
import type { Sphere } from "../item-data";
import type {
  BasePackConfig,
  DataImportOptions,
  DeduplicationData,
  RawData,
  RawDataJson,
  RawTocData,
} from "./pack-util-data";
import { nonNullable } from "../ts-util";
import { getGame } from "../util";

/**
 * Imports data according to a preconfigured config entry or a given config object.
 *
 * @async
 * @param config - The config used for the import
 * @param [options] - Additional options affecting the import process
 * @returns Objects containing a pack reference and the items created therein
 */
export async function importData<T extends RawData, D extends ItemDataConstructorData>(
  config: BasePackConfig<T, D>,
  options: DataImportOptions = {}
) {
  const { create = true, update = true, reset = false } = options;

  const packs = await ensurePacks(config.packNames);
  const rawData = await fetchData(config.fileNames);

  const dedupedData =
    "deduplicationDataGetter" in config ? deduplicateData(config.deduplicationDataGetter) : rawData;

  const dataAfterExtraTreatment =
    "collectionFunctions" in config
      ? // @ts-expect-error Array elements are guaranteed to be homogeneous, there is not mix and match
        config.collectionFunctions?.reduce((acc, fn) => fn(acc), dedupedData)
      : rawData;

  const transformedData: D[] = dataAfterExtraTreatment
    // @ts-expect-error TypeScript gives up and infers `t` as any despite knowing the array's type...
    .map((t) => config.transformFunction(t))
    .filter(nonNullable);

  // Record in which each evential pack gets its own index
  const sortedData: Record<string, { pack: typeof packs[number]; data: D[] }> = {};
  for (const pack of packs) {
    sortedData[pack.metadata.name] = { pack, data: [] };
  }
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
      docs = await packData.pack.getDocuments();
    }

    const createData: D[] = [];
    const updateData: D[] = [];

    // Determine whether document already exists and store accordingly
    for (const entry of packData.data) {
      const existingDocument = docs.find((doc) => doc.name === entry.name);
      if (existingDocument) {
        if (update) updateData.push({ ...entry, _id: existingDocument.id });
      } else {
        if (create) createData.push(entry);
      }
    }

    const result: Record<string, StoredDocument<Item | JournalEntry>[]> = {
      created: [],
      updated: [],
    };

    if (create) {
      const createdItems = await getDocumentClass(config.docType).createDocuments(createData, {
        pack: packName,
      });
      result.created = createdItems;
    }

    if (update) {
      const updatedItems = await getDocumentClass(config.docType).updateDocuments(updateData, {
        pack: packName,
      });
      result.updated = updatedItems as StoredDocument<Item | JournalEntry>[];
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
 * Fetch one or multiple JSON files and read them into JS objects.
 *
 * @async
 * @param fileNames - File names of files to be fetched
 * @returns An array of raw data read from JSON files
 */
async function fetchData(fileNames: string[]): Promise<RawDataJson> {
  const filePromises = fileNames.map(async (fileName) => {
    const file = await fetch(`modules/pf1spheres/raw-packs/${fileName}`);
    const fileJson = await file.json();
    return fileJson;
  });
  const jsons = await Promise.all(filePromises);
  return jsons.flat();
}

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

/**
 * Attempt to determine which sphere is meant from a string not conforming to the module's config
 *
 * @param sphere - String containing a sphere in an unrecognised format
 * @returns The sphere as per the {@link Sphere} type, or undefined if no sphere could be guessed
 */
export function guessSphere(sphere: string): Sphere | undefined {
  const sphereNames = [...Object.keys(PF1S.magicSpheres), ...Object.keys(PF1S.combatSpheres)];
  const slugSphereName = sphere.slugify();
  if (sphereNames.includes(slugSphereName as Sphere)) return slugSphereName as Sphere;
  const guess = sphereNames.find((n) => n.startsWith(slugSphereName.split("-")[0]));
  if (guess) return guess;
  else return undefined;
}

/**
 * Imports Sphere journals for magic and combat spheres, without clearing existing packs beforehand.
 * TODO: Investigate whether this can be moved into the regular import process
 */
export const importSphereJournalData = async () => {
  await ensurePacks(["Magic Spheres", "Combat Spheres"]);
  const rawData = (await fetchData(["tocs.json"])) as RawTocData[];

  const talents = [
    ...((await getGame().packs.get("pf1spheres.combat-talents")?.getDocuments()) ?? []),
    ...((await getGame().packs.get("pf1spheres.magic-talents")?.getDocuments()) ?? []),
  ] as StoredDocument<Item>[];

  const stripTocRegex = /\s(\[|\().*/gm;

  const getTalent = (sphere: Sphere, talent: string) =>
    talents.find((t) => t.data.flags.pf1spheres?.sphere === sphere && t.name?.startsWith(talent));

  const isHeader = (text: string) =>
    ["Talents", "Archetypes", "Feats"].some((s) => text.endsWith(s));

  const journals: Record<"magic" | "combat", JournalEntryDataConstructorData[]> = rawData
    .map(({ name, text, toc }) => {
      const sphere = guessSphere(name);
      if (sphere === undefined) return;

      const sphereType = sphere in PF1S.magicSpheres ? ("magic" as const) : ("combat" as const);

      const icon =
        PF1S.sphereIcons[sphere as keyof typeof PF1S.sphereIcons] ??
        foundry.data.ItemData.DEFAULT_ICON;

      const cleanToc: string = toc.replace(stripTocRegex, "");

      const tocList = cleanToc
        .split("\n")
        .filter((tal) => {
          const bannedNameStarts = [
            "Sphere-Specific Variant Rule",
            "Table: Unarmed Combatants",
            "Table: Practitioner Unarmed Damage",
            "Unarmed Combatants",
          ];
          return !bannedNameStarts.some((name) => tal.startsWith(name));
        })
        .map((tal) => {
          const item = getTalent(sphere, tal);
          if (isHeader(tal)) return `</ul><br><b>${tal}</b><br><ul>`;
          else if (item) return `<li>${item.link}</li>`;
          else return `<li>${tal}</li>`;
        })
        .join("\n");

      const journalText = text + "<br>\n" + tocList + "</ul>";
      return { name, img: icon, content: journalText, sphereType };
    })
    .filter(nonNullable)
    .reduce(
      (acc, { sphereType, ...data }) => {
        acc[sphereType].push(data);
        return acc;
      },
      { magic: [], combat: [] } as Record<"magic" | "combat", JournalEntryDataConstructorData[]>
    );

  for (const [sphereType, data] of Object.entries(journals)) {
    await JournalEntry.createDocuments(data, { pack: `pf1spheres.${sphereType}-spheres` });
  }
};
