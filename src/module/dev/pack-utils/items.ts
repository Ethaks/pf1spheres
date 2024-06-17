/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { ItemDataSource } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import type { ItemPF, PF1ClassDataSource, SaveType } from "../../item-data";
import { getAllSpheres, getSphereType } from "../../item-util";
import { getGame } from "../../util";
import { importData } from "./pack-util";
import type { BasePackConfig, DataImportOptions, DeduplicationData } from "./pack-util-data";
import { RawAbilityData, RawTalentData, RawClassData, RawFeatData } from "./pack-util-data";

export function importAllTalents(options: DataImportOptions) {
  const config: BasePackConfig<RawTalentData, "Item", ItemDataSource> = {
    docType: "Item",
    packNames: ["Magic Talents", "Combat Talents"],
    fileNames: ["talents.json"],
    transformFunction: getTalentData,
    orderByFunction: (talent: DeepPartial<ItemDataSource>) => {
      const sphere = talent.flags?.pf1spheres?.sphere;
      if (!sphere) return undefined;
      const sphereType = getSphereType(sphere);
      return sphereType ? (`${sphereType}-talents` as const) : undefined;
    },
    deduplicationDataGetter: getTalentDedupeData,
    decoder: RawTalentData,
  };
  return importData(config, options);
}

function getTalentDedupeData(data: RawTalentData) {
  const sphereType = getSphereType(data.sphere);
  return {
    shortId: `${sphereType}.${data.name}`,
    longId: `${sphereType}.${data.sphere}.${data.name}`,
    prop: data.sphere,
    suffix: getAllSpheres()[data.sphere],
  };
}

/** Determines whether a given talent('s name) is on the list of banned names */
export function isBannedTalent(entry: RawTalentData | string): boolean {
  const name = typeof entry === "string" ? entry : entry.name;
  const bannedNameStarts = [
    "Sphere-Specific Variant Rule",
    "Table: Unarmed Combatants",
    "Table: Practitioner Unarmed Damage",
    "Unarmed Combatants",
  ];
  return bannedNameStarts.some((bannedName) => name.startsWith(bannedName));
}

function isEmptyTalent(entry: RawTalentData): boolean {
  return !(entry.text.length > 0);
}

/** Transforms a talent's raw data into a format suitable for Foundry Item creation */
function getTalentData(entry: RawTalentData): DeepPartial<ItemDataSource> | undefined {
  if (isBannedTalent(entry)) {
    console.warn(`Discarded ${entry.name}; Reason: banned name`);
    return undefined;
  }

  if (isEmptyTalent(entry)) {
    console.warn(`Discarded ${entry.name}; Reason: No text found`);
    return undefined;
  }

  const talentType = getSphereType(entry.sphere);
  if (talentType === undefined) return undefined;

  return {
    name: entry.name,
    type: "feat",
    img:
      entry.sphere in pf1s.config.sphereIcons
        ? pf1s.config.sphereIcons[entry.sphere as keyof typeof pf1s.config.sphereIcons]
        : undefined,
    system: {
      featType: `${talentType}Talent`,
      description: { value: entry.text },
      tags: entry.tags,
    },
    flags: { pf1spheres: { sphere: entry.sphere } },
  } as DeepPartial<ItemDataSource>;
}

export function importFeats(options: DataImportOptions) {
  const config: BasePackConfig<RawFeatData, "Item", ItemDataSource> = {
    docType: "Item",
    packNames: ["Sphere Feats"],
    fileNames: ["feats.json"],
    transformFunction: getFeatData,
    decoder: RawFeatData,
  };
  return importData(config, options);
}

/** Transforms a feat's raw data into a format suitable for Foundry Item creation */
function getFeatData(t: RawFeatData): DeepPartial<ItemDataSource> {
  return {
    name: t.name,
    type: "feat",
    system: {
      description: { value: t.text },
      tags: t.tags,
    },
  };
}

export function importClasses(options: DataImportOptions) {
  const config: BasePackConfig<RawClassData, "Item", ItemDataSource> = {
    docType: "Item",
    packNames: ["Sphere Classes"],
    fileNames: ["classes.json"],
    transformFunction: getClassData,
    decoder: RawClassData,
  };
  return importData(config, options);
}

function isWeaponProficiency(prof: string): prof is keyof typeof CONFIG.PF1.weaponProficiencies {
  return prof in CONFIG.PF1.weaponProficiencies;
}
function isArmorProficiency(prof: string): prof is keyof typeof CONFIG.PF1.armorProficiencies {
  return prof in CONFIG.PF1.armorProficiencies;
}
/** Transforms a class's raw data into a format suitable for Foundry Item creation */
function getClassData(c: RawClassData): DeepPartial<ItemDataSource> {
  return {
    name: c.name,
    type: "class",
    system: {
      bab: c.bab,
      hd: c.hd,
      savingThrows: Object.entries(c.savingThrows).reduce(
        (acc, [save, val]) => {
          acc[save as SaveType] = { value: val };
          return acc;
        },
        {} as Partial<PF1ClassDataSource["system"]["savingThrows"]>,
      ),
      subType: "base",
      classSkills: Object.fromEntries(
        Object.keys(CONFIG.PF1.skills).map((sk) => [sk, c.classSkills.includes(sk)]),
      ),
      skillsPerLevel: c.skillsPerLevel,
      armorProf: {
        value: c.armorProf.flat().filter(isArmorProficiency) ?? [],
        custom:
          c.armorProf
            .flat()
            .filter((p) => !isArmorProficiency(p))
            .join(";") ?? "",
      },
      weaponProf: {
        value: c.weaponProf.flat().filter(isWeaponProficiency) ?? [],
        custom: c.weaponProf
          .flat()
          .filter((p) => !isWeaponProficiency(p))
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

export function importAbilities(options: DataImportOptions) {
  const config: BasePackConfig<RawAbilityData, "Item", ItemDataSource> = {
    docType: "Item",
    packNames: ["Sphere Class Features"],
    fileNames: ["class-abilities.json"],
    transformFunction: getAbilityData,
    deduplicationDataGetter: getAbilityDeduplicationData,
    decoder: RawAbilityData,
  };
  return importData(config, options);
}

function getAbilityDeduplicationData(data: RawAbilityData): DeduplicationData {
  return { prop: data.class, suffix: data.class, shortId: `class.${data.name}` };
}

/** Transforms a class ability's raw data into a format suitable for Foundry Item creation */
function getAbilityData(abil: RawAbilityData): DeepPartial<ItemDataSource> {
  return {
    name: abil.name,
    type: "feat",
    system: {
      description: { value: abil.text },
      // abilityType: abil.type,
      subType: "classFeat",
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
  packName = "pf1spheres.class-features",
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
          (s) => `<li>${s.id ? `@Compendium[${pack.collection}.${s.id}]{${s.name}}` : s.name}</li>`,
        )
        .join("") +
      endText,
  }));
  return Item.updateDocuments(updates, { pack: pack.collection });
}

/** Creates PF1 Item Links from classes to their features */
export async function linkAbilitiesToClass(
  classPackName = "pf1spheres.classes",
  abilityPackName: "pf1spheres.class-features",
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
        (a) => a.name?.startsWith(feat.name) && a.data.flags.world?.pf1s?.class === cl.name,
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
