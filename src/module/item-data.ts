import type { ActorDataPath, ActorPF } from "./actor-data";
import type { PF1S, PF1CONFIG } from "./config";

export declare class ItemPF extends Item {
  isActive: boolean;
  changes: Collection<ItemChange>;
  hasAction: boolean;
  labels: {
    activation: string;
  };
}

/** The data after preparation, i.e. what's usually available at runtime */
export type PF1ItemDataProperties = PF1ItemDataSource;

/** The source data, i.e. what's guaranteed to be present by the template */
export type PF1ItemDataSource = PF1FeatDataSource | PF1ClassDataSource;

interface PF1ItemDataSourceDescription {
  description: {
    value: string;
    chat: string;
    unidentified: string;
  };
}

interface PF1ItemDataSourceTags {
  tags: string[][];
}

interface PF1ItemDataSourceChanges {
  changes: ItemChangeData[];
}

interface PF1ItemDataSourceUses {
  uses: {
    value: number;
    per: string;
    autoDeductCharges: boolean;
    autoDeductChargesCost: string;
    maxFormula: string;
  };
}

interface PF1ItemDataSourceTagged {
  tag: string;
  useCustomTag: boolean;
}

export interface PF1FeatDataSource {
  type: "feat";
  data: PF1FeatDataSourceData;
}

interface PF1FeatDataSourceData
  extends PF1ItemDataSourceDescription,
    PF1ItemDataSourceTags,
    PF1ItemDataSourceChanges,
    PF1ItemDataSourceUses,
    PF1ItemDataSourceTagged {
  featType:
    | "feat"
    | "classFeat"
    | "trait"
    | "racial"
    | "misc"
    | "template"
    | keyof typeof PF1CONFIG.featTypes;
  abilityType: "classFeat";
}

export interface PF1ClassDataSource {
  type: "class";
  data: PF1ClassDataSourceData;
}

interface PF1ClassDataSourceData
  extends PF1ItemDataSourceDescription,
    PF1ItemDataSourceTags,
    PF1ItemDataSourceChanges,
    PF1ItemDataSourceTagged {
  level: number;
  bab: BABProgression;
  hd: number;
  classType: "base";
  savingThrows: Record<SaveType, { value: "high" | "low" }>;
  classSkills: Record<string, boolean>;
  skillsPerLevel: number;
  armorProf: { value: Array<keyof typeof CONFIG.PF1.armorProficiencies>; custom: string };
  weaponProf: { value: Array<keyof typeof CONFIG.PF1.weaponProficiencies>; custom: string };
}

export type CasterProgression = keyof typeof PF1S.progression | "";

export type Sphere = CombatSphere | MagicSphere;

export type CombatSphere = keyof typeof PF1S.combatSpheres;
export type MagicSphere = keyof typeof PF1S.magicSpheres;

export type ChangeTarget = SphereChangeTarget | PFBuffTarget;

export type SphereChangeTarget =
  | keyof typeof PF1CONFIG.buffTargets
  | SphereCLChangeTarget
  | SphereBABChangeTarget;

export type SphereCLChangeTarget = `spherecl${Capitalize<MagicSphere>}`; //`

export type SphereBABChangeTarget = `spherebab${Capitalize<CombatSphere>}`;

/************************/
/*   PF1 CONFIG BELOW   */
/************************/

/*
 * Item Types from the PF1 system
 */
export type ItemType =
  | "weapon"
  | "equipment"
  | "consumable"
  | "loot"
  | "class"
  | "spell"
  | "feat"
  | "buff"
  | "attack"
  | "race"
  | "container";

/*
 * Bonus Modifier types from the PF1 system, used for Changes
 */
export type BonusModifier =
  | "untyped"
  | "untypedPerm"
  | "base"
  | "enh"
  | "dodge"
  | "inherent"
  | "deflection"
  | "morale"
  | "luck"
  | "sacred"
  | "insight"
  | "resist"
  | "profane"
  | "trait"
  | "racial"
  | "size"
  | "competence"
  | "circumstance"
  | "alchemical"
  | "penalty"
  | keyof typeof PF1CONFIG.bonusModifiers;

export type PFBuffTarget = "cmd";

type BABProgression = "high" | "med" | "low";

export type SaveType = "fort" | "ref" | "will";
export type SaveProgression = "high" | "low";

export declare class ItemChange {
  data: ItemChangeData;
  parent: ActorPF;
  static create(data: ItemChangeCreateData): ItemChange;
}

export interface ItemChangeData {
  _id: string;
  formula: string;
  /** This is "add" by default */
  operator: "add" | "set" | "script";
  subTarget: ChangeTarget;
  modifier: BonusModifier;
  priority: number;
  value: number;
}
export type ItemChangeCreateData = Omit<ItemChangeData, "_id" | "operator" | "value" | "priority"> &
  Partial<Pick<ItemChangeData, "operator" | "priority">>;

// TODO: This type can be refined a bit even without typing the PF1 system
export type RollData = {
  [key: string]: string | number | RollData;
};

export type SourceDetails = {
  [Key in ActorDataPath]: SourceEntry[];
};
export type SourceInfo = {
  [Key in ActorDataPath]?: SourceInfoEntry;
}; // Record<ActorDataPath & string, SourceInfoEntry>;
export interface SourceInfoEntry {
  positive: SourceEntry[];
  negative: SourceEntry[];
}
export interface SourceEntry {
  name: string;
  value: number;
}
