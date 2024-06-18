/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { ActorDataPath, ActorPF } from "./actor-data";
import type { PF1CONFIG_EXTRA } from "./config-extra";

declare global {
  interface DocumentClassConfig {
    Item: typeof ItemPF;
  }

  /** Source Data configuration for the PF1 system */
  interface SourceConfig {
    Item: PF1ItemDataSource;
  }

  interface DataConfig {
    Item: PF1ItemDataProperties;
  }

  interface FlagConfig {
    Item: {
      pf1spheres?: {
        sphere?: Sphere;
        casterProgression?: CasterProgression;
        countExcluded?: boolean;
      };
    };
  }
}

export declare class ItemPF extends Item {
  isActive: boolean;
  changes: Collection<ItemChange>;
  hasAction: boolean;
  getLabels(): {
    activation: string;
  };

  // TODO: v10 hack, check with updated types
  flags: ItemPF["data"]["flags"];
  system: PF1ItemDataProperties["system"];
  static DEFAULT_ICON: string;
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
  tags: string[];
}

interface PF1ItemDataSourceChanges {
  changes: ItemChangeData[];
  contextNotes: ContextNoteData[];
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
  // TODO: v10 hack, check with updated types
  system: PF1FeatDataSourceData;
}

interface PF1FeatDataSourceData
  extends PF1ItemDataSourceDescription,
    PF1ItemDataSourceTags,
    PF1ItemDataSourceChanges,
    PF1ItemDataSourceUses,
    PF1ItemDataSourceTagged {
  subType:
    | "feat"
    | "classFeat"
    | "trait"
    | "racial"
    | "misc"
    | "template"
    | keyof typeof PF1CONFIG_EXTRA.featTypes;
}

export interface PF1ClassDataSource {
  type: "class";
  // TODO: v10 hack, check with updated types
  system: PF1ClassDataSourceData;
}

interface PF1ClassDataSourceData
  extends PF1ItemDataSourceDescription,
    PF1ItemDataSourceTags,
    PF1ItemDataSourceChanges,
    PF1ItemDataSourceTagged {
  level: number;
  bab: BABProgression;
  hd: number;
  subType: "base";
  savingThrows: Record<SaveType, { value: "high" | "low" }>;
  classSkills: Record<string, boolean>;
  skillsPerLevel: number;
  armorProf: { value: (keyof typeof CONFIG.PF1.armorProficiencies)[]; custom: string };
  weaponProf: { value: (keyof typeof CONFIG.PF1.weaponProficiencies)[]; custom: string };
}

export type CasterProgression = keyof typeof pf1s.config.progression | "";

export type Sphere = CombatSphere | MagicSphere | SkillSphere;

export type CombatSphere = keyof typeof pf1s.config.combatSpheres;
export type MagicSphere = keyof typeof pf1s.config.magicSpheres;
export type SkillSphere = keyof typeof pf1s.config.skillSpheres;

export type ChangeTarget = SphereChangeTarget | PFBuffTarget;

export type SphereChangeTarget =
  | keyof typeof PF1CONFIG_EXTRA.buffTargets
  | SphereCLChangeTarget
  | SphereBABChangeTarget;

/** Specific Sphere CL */
export type SphereCLChangeTarget = `spherecl${Capitalize<MagicSphere>}`; //`

/** Specific Sphere BAB */
export type SphereBABChangeTarget = `spherebab${Capitalize<CombatSphere>}`; // `

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
export type BonusType =
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
  | keyof typeof PF1CONFIG_EXTRA.bonusTypes;

export type PFBuffTarget = "cmd";

export type BABProgression = "high" | "med" | "low";

export type SaveType = "fort" | "ref" | "will";
export type SaveProgression = "high" | "low";

export declare class ItemChange {
  constructor(data: ItemChangeCreateData);
  data: ItemChangeData;
  parent: ActorPF;
  static create(data: ItemChangeCreateData, parent: ItemChangeCreateContext): Promise<ItemChange>;
  get source(): ItemChangeData;
}

export interface ItemChangeData {
  _id: string;
  formula: string;
  /** This is "add" by default */
  operator: "add" | "set" | "script";
  target: ChangeTarget;
  modifier: BonusType;
  priority: number;
  value: number;
  flavor?: string;
}
export type ItemChangeCreateData = Omit<ItemChangeData, "_id" | "operator" | "priority" | "value"> &
  Partial<Pick<ItemChangeData, "operator" | "priority" | "value">>;

interface ItemChangeCreateContext {
  parent?: Item | Actor;
}

// TODO: This type can be refined a bit even without typing the PF1 system
export interface RollData {
  [key: string]: string | number | RollData;
}

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

export type SourceEntry = SourceEntryBase & (SourceEntryValue | SourceEntryFormula);
interface SourceEntryBase {
  name: string;
  type?: string;
  modifier?: string;
}
interface SourceEntryFormula {
  value?: never;
  formula: string;
}
interface SourceEntryValue {
  value: number;
  formula?: never;
}

interface ContextNoteData {
  text: string;
  target:
    | keyof typeof CONFIG.PF1.contextNoteTargets
    | keyof typeof PF1CONFIG_EXTRA.contextNoteTargets;
}
