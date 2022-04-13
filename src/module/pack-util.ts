/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { ItemDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import { PF1S } from "./config";
import type {
  ItemPF,
  PF1ClassDataSource,
  PF1FeatDataSource,
  SaveProgression,
  SaveType,
  Sphere,
} from "./item-data";
import { getGame } from "./util";

/** Preconfigured data import templates */
const configs: Record<string, PackConfig> = {
  magicTalents: {
    packNames: ["Magic Talents"],
    fileNames: ["magic-talents.json"],
    transformFunction: getTalentData,
  },
  combatTalents: {
    packNames: ["Combat Talents"],
    fileNames: ["combat-talents.json"],
    transformFunction: getTalentData,
  },
  mixedTalents: {
    packNames: ["Magic Talents", "Combat Talents"],
    fileNames: ["talents.json"],
    transformFunction: getTalentData,
    orderByFunction: getTalentType,
    extraFunctions: [filterWrongTalents, deduplicateData],
  },
  feats: {
    packNames: ["Spheres Feats"],
    fileNames: ["feats.json"],
    transformFunction: getFeatData,
  },
  classes: {
    packNames: ["Spheres Classes"],
    fileNames: ["classes.json"],
    transformFunction: getClassData,
  },
  classAbilities: {
    packNames: ["Spheres Class Features"],
    fileNames: ["class-abilities.json"],
    transformFunction: getAbilityData,
    extraFunctions: [deduplicateData],
  },
};

/** The minimum data common to all raw data objects */
interface RawDataBase {
  name: string;
  text: string;
}
type RawData = RawClassData | RawTalentData | RawFeatData | RawAbilityData;

/** Additional options affecting an import process */
interface DataImportOptions {
  /** Create new documents */
  create?: boolean;
  /** Update existing documents (determined by name) */
  update?: boolean;
  /** Delete all documents before importing */
  reset?: boolean;
}

/**
 * Imports data according to a preconfigured config entry or a given config object.
 *
 * @async
 * @param conf - The config used for the import
 * @param [options] - Additional options affecting the import process
 * @returns Objects containing a pack reference and the items created therein
 */
export async function importData(conf: string | PackConfig, options: DataImportOptions = {}) {
  const config = typeof conf === "string" ? configs[conf] : conf;
  if (config === undefined) throw new Error(`No config object found for parameter ${conf}`);
  const { create = true, update = true, reset = false } = options;

  const packs = await ensurePacks(config.packNames);
  const rawData = await fetchData(config.fileNames);

  const dataAfterExtraTreatment = config.extraFunctions
    ? config.extraFunctions.reduce((acc, fn) => fn(acc), rawData)
    : rawData;

  const transformedData = dataAfterExtraTreatment
    .map(config.transformFunction)
    .filter((data): data is ItemDataConstructorData => Boolean(data));

  // Record in which each evential pack gets its own index
  const sortedData: Record<
    string,
    { pack: typeof packs[number]; data: ItemDataConstructorData[] }
  > = {};
  for (const pack of packs) {
    sortedData[pack.metadata.name] = { pack, data: [] };
  }
  // There's only one pack to create, so no sorting to determine target pack necessary
  if (packs.length < 2) sortedData[packs[0].metadata.name].data = transformedData;
  else {
    if (!config.orderByFunction)
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

    const createData: ItemDataConstructorData[] = [];
    const updateData: ItemDataConstructorData[] = [];

    // Determine whether document already exists and store accordingly
    for (const entry of packData.data) {
      const existingDocument = docs.find((doc) => doc.name === entry.name);
      if (existingDocument) {
        if (update) updateData.push({ ...entry, _id: existingDocument.id });
      } else {
        if (create) createData.push(entry);
      }
    }

    const result: Record<string, StoredDocument<Item>[] | ItemPF[]> = { created: [], updated: [] };

    if (create) {
      const createdItems = await Item.createDocuments(createData, {
        pack: packName,
      });
      result.created = createdItems;
    }

    if (update) {
      const updatedItems = await Item.updateDocuments(updateData, { pack: packName });
      result.updated = updatedItems;
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
async function fetchData(fileNames: string[]): Promise<RawData[]> {
  const filePromises = fileNames.map(async (fileName) => {
    const file = await fetch(`modules/pf1spheres/raw-packs/${fileName}`);
    const fileJson: RawData[] = await file.json();
    return fileJson;
  });
  const jsons = await Promise.all(filePromises);
  return jsons.flat();
}

/** Various strings used to determine whether something is a duplicate, and how it should be named */
interface DeduplicationData {
  /** Value of the primary property used to determine whether elements should be pruned/renamed */
  prop: string;
  /** A string appended to the entry's name to avoid multiple entries with the same name in one pack */
  suffix: string;
  /** ID used to determine whether two entries are actual duplicates or only naming conflicts*/
  longId?: string;
  /** ID used to determine whether entries would conflict within the same pack */
  shortId: string;
}

/**
 * Collects {@link DeduplicationData} used thoughout a deduplication process belonging to an entry.
 *
 * @param data - A single data entry
 * @throws {Error} - If no deduplication data can be generated
 * @returns Data relevant to this data entry
 */
function getDedupeData(data: RawTalentData | RawAbilityData): DeduplicationData {
  if ("sphere" in data) {
    const sphereType = getTalentType(data);
    return {
      shortId: `${sphereType}.${data.name}`,
      longId: `${sphereType}.${data.sphere}.${data.name}`,
      prop: data.sphere,
      suffix: { ...PF1S.combatSpheres, ...PF1S.magicSpheres }[data.sphere as Sphere],
    };
  } else if ("class" in data)
    return { prop: data.class, suffix: data.class, shortId: `class.${data.name}` };
  else throw new Error("Could not determine distinguishing property");
}

/**
 * Discovers duplicates and naming conflicts, solving the latter by adjusting entries' names
 *
 * @param dataJson - An array of raw data to be checked
 * @returns An array of data, hopefully free from duplicates and naming conflicts
 */
function deduplicateData(dataJson: RawData[]): RawData[] {
  const unhandledData: RawData[] = [];
  const itemArraysByName = dataJson.reduce((acc, item) => {
    // If this item type is not handled, don't handle this item at all
    if (!("class" in item || "sphere" in item)) {
      unhandledData.push(item);
      return acc;
    }
    const dedupeData = getDedupeData(item);
    (acc[dedupeData.shortId] || (acc[dedupeData.shortId] = [])).push({ item, dedupeData });
    return acc;
  }, {} as Record<string, Array<{ item: RawAbilityData | RawTalentData; dedupeData: DeduplicationData }>>);

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
  return [...unhandledData, ...newData];
}

interface RawTalentData extends RawDataBase {
  tags: string[];
  sphere: string;
}

/**
 * Determine whether a talent is a combat talent or a magic talent
 *
 * @param entry - Data for which the type is to be determined
 * @returns The talent's type
 */
function getTalentType(
  entry: ItemDataConstructorData | RawTalentData
): `${"magic" | "combat"}-talents` | undefined {
  const dataType = isMagicTalent(entry)
    ? "magic-talents"
    : isCombatTalent(entry)
    ? "combat-talents"
    : undefined;
  return dataType;
}

/** Determine whether a talent is a magic talent */
function isMagicTalent(data: ItemDataConstructorData | RawTalentData): boolean {
  const sphere = "sphere" in data ? data.sphere : data.flags?.pf1spheres?.sphere;
  return (sphere && sphere in PF1S.magicSpheres) || false;
}

/** Determine whether a talent is a combat talent */
function isCombatTalent(data: ItemDataConstructorData | RawTalentData): boolean {
  const sphere = "sphere" in data ? data.sphere : data.flags?.pf1spheres?.sphere;
  return (sphere && sphere in PF1S.combatSpheres) || false;
}

/**
 * Attempt to determine which sphere is meant from a string not conforming to the module's config
 *
 * @param sphere - String containing a sphere in an unrecognised format
 * @returns The sphere as per the {@link Sphere} type, or undefined if no sphere could be guessed
 */
function guessSphere(sphere: string): Sphere | undefined {
  const sphereNames = [...Object.keys(PF1S.magicSpheres), ...Object.keys(PF1S.combatSpheres)];
  const guess = sphereNames.find((n) => n.startsWith(sphere.split(" ")[0]));
  if (guess) return guess;
  else return undefined;
}

/** Remove specific talent data entries not actually representing a talent */
function filterWrongTalents(data: RawData[]): RawData[] {
  const bannedNameStarts = [
    "Sphere-Specific Variant Rule",
    "Table: Unarmed Combatants",
    "Table: Practitioner Unarmed Damage",
    "Unarmed Combatants",
  ];
  return data.filter((d) => {
    if (bannedNameStarts.some((name) => d.name.startsWith(name))) {
      console.warn(`Discarded ${d.name}; Reason: banned name`);
      return false;
    }
    if (d.text.length < 1) {
      console.warn(`Discarded ${d.name}; Reason: No text found`);
      return false;
    }

    // Assume entry data to be acceptable
    return true;
  });
}

/** Transforms a talent's raw data into a format suitable for Foundry Item creation */
function getTalentData(t: RawTalentData): ItemDataConstructorData | undefined {
  const sphere =
    t.sphere in PF1S.magicSpheres || t.sphere in PF1S.combatSpheres
      ? (t.sphere as Sphere)
      : guessSphere(t.sphere);

  if (sphere === undefined) {
    console.warn(`Discarded ${t.name}: No sphere could be guessed from ${t.sphere}`);
    return undefined;
  }
  const talentType = sphere in PF1S.magicSpheres ? "magicTalent" : "combatTalent";

  return {
    name: t.name,
    type: "feat",
    img:
      sphere in PF1S.sphereIcons
        ? PF1S.sphereIcons[sphere as keyof typeof PF1S.sphereIcons]
        : undefined,
    data: {
      featType: talentType,
      description: { value: t.text },
      tags: t.tags.map((tag) => [tag]),
    },
    flags: { pf1spheres: { sphere: sphere } },
  };
}

interface RawFeatData extends RawDataBase {
  tags: string[];
}

/** Transforms a feat's raw data into a format suitable for Foundry Item creation */
function getFeatData(t: RawFeatData): ItemDataConstructorData {
  return {
    name: t.name,
    type: "feat",
    data: {
      description: { value: t.text },
      tags: t.tags.map((tag) => [tag]),
    },
  };
}

interface RawClassData extends RawDataBase {
  bab: PF1ClassDataSource["data"]["bab"];
  hd: number;
  hp: number;
  savingThrows: Record<SaveType, SaveProgression>;
  classSkills: string[];
  skillsPerLevel: number;
  armorProf: Array<keyof typeof CONFIG.PF1.armorProficiencies>[];
  weaponProf: Array<keyof typeof CONFIG.PF1.weaponProficiencies>[];
  links: { name: string; level: number }[];
}

function isCustomProficiency(proficiencyType: "armor" | "weapon", proficiency: string): boolean {
  return proficiency in CONFIG.PF1[`${proficiencyType}Proficiencies`];
}
/** Transforms a class's raw data into a format suitable for Foundry Item creation */
function getClassData(c: RawClassData): ItemDataConstructorData {
  return {
    name: c.name,
    type: "class",
    data: {
      bab: c.bab,
      hd: c.hd,
      savingThrows: Object.entries(c.savingThrows).reduce((acc, [save, val]) => {
        acc[save as SaveType] = { value: val };
        return acc;
      }, {} as Partial<PF1ClassDataSource["data"]["savingThrows"]>),
      classType: "base",
      classSkills: Object.fromEntries(
        Object.keys(CONFIG.PF1.skills).map((sk) => [sk, c.classSkills.includes(sk)])
      ),
      skillsPerLevel: c.skillsPerLevel,
      armorProf: {
        value: c.armorProf.filter(([p]) => !isCustomProficiency("armor", p)).flat() ?? [],
        custom:
          c.armorProf
            .filter(([p]) => isCustomProficiency("armor", p))
            .flat()
            .join(";") ?? "",
      },
      weaponProf: {
        value: c.weaponProf.filter(([p]) => isCustomProficiency("weapon", p)).flat() ?? [],
        custom: c.weaponProf
          .filter(([p]) => isCustomProficiency("weapon", p))
          .flat()
          .join(";"),
      },
      description: { value: c.text },
    },
    flags: {
      world: {
        pf1s: {
          classFeatures: c.links,
        },
      },
    },
  };
}

interface RawAbilityData extends RawDataBase {
  type: PF1FeatDataSource["data"]["abilityType"];
  class: string;
  sub_abilities: string[];
}
/** Transforms a class ability's raw data into a format suitable for Foundry Item creation */
function getAbilityData(abil: RawAbilityData): ItemDataConstructorData {
  return {
    name: abil.name,
    type: "feat",
    data: {
      description: { value: abil.text },
      abilityType: abil.type,
      featType: "classFeat",
    },
    flags: {
      world: {
        pf1s: {
          class: abil.class ?? undefined,
          subAbilities: abil.sub_abilities ?? [],
        },
      },
    },
  };
}

const baseText = "<hr>See also:<br><ul>";
const endText = "</ul>";

/** Appends links to sub abilities to their parent ability's text */
export async function linkAbilitiesToAbilities(
  packName = "pf1spheres.class-features"
): Promise<ItemPF[] | undefined> {
  const pack = getGame().packs.get(packName);
  if (!pack) return;
  const docs = await pack.getDocuments();
  // @ts-expect-error Only available for imports
  const mainAbils = docs.filter((d) => d.data.flags.world?.pf1s?.subAbilities?.length);
  const updates = mainAbils.map((abil) => ({
    _id: abil.id,
    "data.description.value":
      // @ts-expect-error Only available for imports
      abil.data.data.description.value +
      baseText +
      // @ts-expect-error Only available for imports
      (abil.data.flags.world.pf1s.subAbilities as string[])
        .map((sub: string) => ({ name: sub, id: pack.getName(sub)?.id ?? undefined }))
        .map(
          (s) => `<li>${s.id ? `@Compendium[${pack.collection}.${s.id}]{${s.name}}` : s.name}</li>`
        )
        .join("") +
      endText,
  }));
  return Item.updateDocuments(updates, { pack: pack.collection });
}

/** Creates PF1 Item Links from classes to their features */
export async function linkAbilitiesToClass(
  classPackName = "pf1spheres.classes",
  abilityPackName: "pf1spheres.class-features"
): Promise<ItemPF[] | undefined> {
  const classPack = getGame().packs.get(classPackName);
  const abilityPack = getGame().packs.get(abilityPackName);
  if (!classPack || !abilityPack) return;
  const classes = (await classPack.getDocuments()) as Item[];
  const abilities = (await abilityPack.getDocuments()) as Item[];
  const updates = classes.map((cl) => ({
    _id: cl.id,
    // @ts-expect-error Only available for imports
    "data.links.classAssociations": cl.data.flags.world?.pf1s?.classFeatures.map((feat, index) => {
      const item = abilities.find(
        // @ts-expect-error Only available for imports
        (a) => a.name?.startsWith(feat.name) && a.data.flags.world?.pf1s?.class === cl.name
      );
      return {
        id: item?.uuid.split("Compendium.")[1],
        dataType: "compendium",
        name: feat.name,
        img: item?.img,
        level: feat.level,
        _index: index,
        hiddenLinks: {},
      };
    }),
  }));
  return Item.updateDocuments(updates, { pack: classPack.collection });
}

interface PackConfig {
  packNames: string[];
  fileNames: string[];
  /**
   * A function transforming source data into Foundry-conforming shape,
   * or undefined if data is to be dropped or no viable data could be extracted
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformFunction: (arg: any) => ItemDataConstructorData | undefined;
  extraFunctions?: ((arg: RawData[]) => RawData[])[];
  /** A function that returns one of this config's {@link PackConfig.packNames} to which an individual document belongs */
  orderByFunction?: (arg: ItemDataConstructorData) => string | undefined;
}
