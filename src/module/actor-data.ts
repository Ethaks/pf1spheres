/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { ItemPF, RollData, SourceDetails, SourceInfo, Sphere } from "./item-data";
import type { TotalData, TotalModData, ValueData } from "./common-data";
import type { PropPath } from "./ts-util";
import type { getActorMethods } from "./actor-methods";

declare global {
  interface DocumentClassConfig {
    Actor: typeof ActorPF;
  }
  interface SourceConfig {
    Actor: PF1ActorDataSource | PF1BasicActorData;
  }
  interface DataConfig {
    Actor: PF1ActorDataProperties | PF1BasicActorData;
  }
  interface FlagConfig {
    Actor: {
      pf1spheres?: SpheresActorFlags;
    };
  }
}

export interface SpheresActorFlags {
  /** The ability used by this actor for magic skill checks */
  castingAbility?: Ability | "";
}

export declare class ActorPF extends Actor {
  /** Various Spheres-related functions working like methods for this actor */
  spheres: ReturnType<typeof getActorMethods>;
  /**
   * Final source details used for tooltips etc.
   */
  sourceDetails: SourceDetails;
  /**
   * Working object for sourceDetails
   */
  sourceInfo: SourceInfo;
  /** @override */
  getRollData(): RollData;

  /** All active Items with Context Notes */
  get allNotes(): Array<{
    item: ItemPF;
    notes: Array<{ text: string; target: keyof typeof CONFIG.PF1.contextNoteTargets }>;
  }>;

  formatContextNotes(
    notes: Array<{ item: Item; notes: string[] }>,
    rollData: RollData,
    options?: { roll: boolean },
  ): string[];

  // TODO: v10 hack, check with updated types
  system: PF1ActorDataPropertiesData;
  flags: Actor["data"]["flags"];
}

export interface PF1ActorSpheresData {
  /** Caster Level data for Spheres of Power */
  cl: ValueData<number> & MagicSpheresRecord;
  /** Convenience shortcut for the actor's configured Casting Ability Modifier */
  cam: number;
  /** Magic Skill Bonus data for Spheres of Power */
  msb: ValueData<number>;
  /** Concentration data for Spheres of Power */
  concentration: TotalData<number>;
  msd: ValueData<number>;
  bab: CombatSpheresRecord;
  talents: SpheresTalentsRecord;
}

type MagicSpheresRecord = {
  -readonly [Sphere in keyof typeof pf1s.config.magicSpheres]-?: TotalModData<number>;
};

type CombatSpheresRecord = {
  -readonly [Sphere in keyof typeof pf1s.config.combatSpheres]-?: TotalModData<number>;
};

export type SpheresTalentsRecord = Record<
  Sphere,
  { total: number; excluded: number; value: number }
>;

/* PF1 Source Data */
interface PF1BasicActorData {
  type: "basic";
  // TODO: v10 hack, check with updated types
  system: Record<string, never>;
}

export type PF1ActorDataSource = {
  type: "character" | "npc";
  // TODO: v10 hack, check with updated types
  system: PF1ActorDataSourceData;
};

export interface PF1ActorDataSourceData {
  abilities: AbilitiesSourceData;
}

/** A union of strings containing valid ability score abbreviations */
export type Ability = "str" | "dex" | "con" | "int" | "wis" | "cha";

/** Source data for an actor's `data.abilities` */
type AbilitiesSourceData = Record<Ability, AbilitySourceData>;

/** A single ability's source data */
interface AbilitySourceData {
  value: number;
  damage: number;
  drain: number;
  userPenalty: number;
}

/* PF1 Prepared Data */

export type PF1ActorDataProperties = {
  type: "character" | "npc";
  // TODO: v10 hack, check with updated types
  system: PF1ActorDataPropertiesData;
};

export interface PF1ActorDataPropertiesData extends PF1ActorDataSourceData {
  /** An actor's attributes data (containing most of all data) after preparation */
  attributes: AttributesPropertiesData;
  /** An actor's abilities data after preparation */
  abilities: AbilitiesPropertiesData;
  conditions: Record<Condition, boolean>;

  /** Guaranteed to be complete after base data preparation */
  spheres: PF1ActorSpheresData | undefined;
}

interface AttributesPropertiesData {
  cmd: {
    total: number;
  };
  bab: {
    total: number;
  };
}

/** An actor's `data.abilities` object including derived values after preparation */
type AbilitiesPropertiesData = Record<Ability, AbilityPropertiesData>;
/** A single ability's data including derived values after preparation */
interface AbilityPropertiesData extends AbilitySourceData {
  /** This ability's modifier value */
  mod: number;
  base: number;
  baseMod: number;
  checkMod: number;
  penalty: number;
  total: number;
}

type Condition = SphereCondition;
type SphereCondition = "battered";

/** A path pointing towards a property of an actor's data */
export type ActorDataPath = PropPath<PF1ActorDataProperties>;
export type ActorSpheresDataPath = PropPath<PF1ActorSpheresData>;
