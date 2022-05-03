import type { ItemDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import { PF1S } from "../config";
import type { ItemPF, PF1ClassDataSource, SaveType } from "../item-data";
import { getAllSpheres, getSphereType } from "../item-util";
import { getGame } from "../util";
import { importData } from "./pack-util";
import type {
  BasePackConfig,
  DataImportOptions,
  DeduplicationData,
  RawAbilityData,
  RawClassData,
  RawFeatData,
  RawTalentData,
} from "./pack-util-data";

// TODO: Move away from config object, to one function for each import scenario, giving its config to a central importItems function

export function importAllTalents(options: DataImportOptions) {
  const config: BasePackConfig<RawTalentData, ItemDataConstructorData> = {
    docType: "Item",
    packNames: ["Magic Talents", "Combat Talents"],
    fileNames: ["talents.json"],
    transformFunction: getTalentData,
    orderByFunction: (talent: ItemDataConstructorData) => {
      const sphere = talent.flags?.pf1spheres?.sphere;
      if (!sphere) return undefined;
      const sphereType = getSphereType(sphere);
      return sphereType ? (`${sphereType}-talents` as const) : undefined;
    },
    deduplicationDataGetter: getTalentDedupeData,
  };
  return importData(config, options);
}

function getTalentDedupeData(data: RawTalentData) {
  return {
    shortId: `${data.sphere}.${data.name}`,
    longId: `${data.sphere}.${data.sphere}.${data.name}`,
    prop: data.sphere,
    suffix: getAllSpheres()[data.sphere],
  };
}

/** Remove specific talent data entries not actually representing a talent */
function isBannedTalent(entry: RawTalentData): boolean {
  const bannedNameStarts = [
    "Sphere-Specific Variant Rule",
    "Table: Unarmed Combatants",
    "Table: Practitioner Unarmed Damage",
    "Unarmed Combatants",
  ];
  return bannedNameStarts.some((name) => entry.name.startsWith(name));
}

function isEmptyTalent(entry: RawTalentData): boolean {
  return Boolean(entry.text.length > 0);
}

/** Transforms a talent's raw data into a format suitable for Foundry Item creation */
function getTalentData(entry: RawTalentData): ItemDataConstructorData | undefined {
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
      entry.sphere in PF1S.sphereIcons
        ? PF1S.sphereIcons[entry.sphere as keyof typeof PF1S.sphereIcons]
        : undefined,
    data: {
      featType: `${talentType}Talent`,
      description: { value: entry.text },
      tags: entry.tags.map((tag) => [tag]),
    },
    flags: { pf1spheres: { sphere: entry.sphere } },
  };
}

export function importFeats(options: DataImportOptions) {
  const config: BasePackConfig<RawFeatData, ItemDataConstructorData> = {
    docType: "Item",
    packNames: ["Sphere Feats"],
    fileNames: ["feats.json"],
    transformFunction: getFeatData,
  };
  return importData(config, options);
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

export function importClasses(options: DataImportOptions) {
  const config: BasePackConfig<RawClassData, ItemDataConstructorData> = {
    docType: "Item",
    packNames: ["Spheres Classes"],
    fileNames: ["classes.json"],
    transformFunction: getClassData,
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
  const config: BasePackConfig<RawAbilityData, ItemDataConstructorData> = {
    docType: "Item",
    packNames: ["Spheres Class Features"],
    fileNames: ["class-abilities.json"],
    transformFunction: getAbilityData,
    deduplicationDataGetter: getAbilityDeduplicationData,
  };
  return importData(config, options);
}

function getAbilityDeduplicationData(data: RawAbilityData): DeduplicationData {
  return { prop: data.class, suffix: data.class, shortId: `class.${data.name}` };
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
