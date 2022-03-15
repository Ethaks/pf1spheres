import { ItemDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import {
  ItemPF,
  PF1ClassDataSource,
  PF1FeatDataSource,
  SaveProgression,
  SaveType,
  Sphere,
} from "./item-data";
import { getGame } from "./util";

const configs: Record<string, PackConfig> = {
  magicTalents: {
    packName: "Magic Talents",
    fileName: "magic-talents.json",
    talentType: "magicTalent",
    transformFunction: getTalentData("magicTalent"),
  },
  combatTalents: {
    packName: "Combat Talents",
    fileName: "combat-talents.json",
    talentType: "combatTalent",
    transformFunction: getTalentData("magicTalent"),
  },
  feats: {
    packName: "Sphere Feats",
    fileName: "feats.json",
    transformFunction: getFeatData,
  },
  classes: {
    packName: "Sphere Classes",
    fileName: "classes.json",
    transformFunction: getClassData,
  },
  classAbilities: {
    packName: "Sphere Class Features",
    fileName: "class-abilities.json",
    transformFunction: getAbilityData,
  },
};

export async function createPack(conf: keyof typeof configs): Promise<{
  pack: CompendiumCollection<CompendiumCollection.Metadata>;
  dataJson: unknown;
  transformedData: unknown;
  items: StoredDocument<ItemPF>[];
}> {
  const config = configs[conf];
  /* Data retrieval and item creation workflow */
  // @ts-expect-error Partial data works for creation
  const pack = await CompendiumCollection.createCompendium({
    label: config.packName,
    type: "Item",
  });
  const file = await fetch(`/modules/pf1spheres/raw-packs/${config.fileName}`);
  const dataJson = await file.json();
  const transformedData = dataJson.map(config.transformFunction);

  const items = await Item.createDocuments(transformedData, {
    pack: `world.${pack.metadata.name}`,
  });
  ui?.notifications?.info(`Created ${items.length} documents in world pack ${config.packName}!`);
  return { pack, dataJson, transformedData, items };
}
interface RawData {
  name: string;
  text: string;
}
interface RawTalentData extends RawData {
  tags: string[];
  sphere: Sphere;
}
function getTalentData(
  talentType: "combatTalent" | "magicTalent"
): (t: RawTalentData) => ItemDataConstructorData {
  return (t) => ({
    name: t.name,
    type: "feat",
    img: ["bear", "mana"].includes(t.sphere)
      ? undefined
      : `modules/pf1spheres/assets/icons/spheres/${t.sphere.replace(" ", "_")}.webp`,
    data: {
      featType: talentType,
      description: { value: t.text },
      tags: t.tags.map((tag) => [tag]),
    },
    flags: { pf1spheres: { sphere: t.sphere } },
  });
}

interface RawFeatData extends RawData {
  tags: string[];
}
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

interface RawClassData extends RawData {
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
        value:
          c.armorProf
            .filter(([p]) =>
              Object.keys(CONFIG.PF1.armorProficiencies).includes(
                p as keyof typeof CONFIG.PF1.armorProficiencies
              )
            )
            .flat() ?? [],
        custom:
          c.armorProf
            .filter(
              ([p]) =>
                !Object.keys(CONFIG.PF1.armorProficiencies).includes(
                  p as keyof typeof CONFIG.PF1.armorProficiencies
                )
            )
            .join(";") ?? "",
      },
      weaponProf: {
        value:
          c.weaponProf
            .filter(([p]) =>
              Object.keys(CONFIG.PF1.weaponProficiencies).includes(
                p as keyof typeof CONFIG.PF1.weaponProficiencies
              )
            )
            .flat() ?? [],
        custom: c.weaponProf
          .filter(
            ([p]) =>
              !Object.keys(CONFIG.PF1.weaponProficiencies).includes(
                p as keyof typeof CONFIG.PF1.weaponProficiencies
              )
          )
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

interface RawAbilityData extends RawData {
  type: PF1FeatDataSource["data"]["abilityType"];
  class: string;
  sub_abilities: string[];
}
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

export async function linkAbilitiesToAbilities(packName: string): Promise<ItemPF[] | undefined> {
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

export async function linkAbilitiesToClass(
  classPackName: string,
  abilityPackName: string
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
        (a) => a.name === feat.name && a.data.flags.world?.pf1s?.class === cl.name
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
  packName: string;
  fileName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformFunction: (arg: any) => ItemDataConstructorData;
  talentType?: "magicTalent" | "combatTalent";
}
