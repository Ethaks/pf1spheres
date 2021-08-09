import { SourceDetails, SourceInfo } from "./item-data";
import { TotalModData, ValueData } from "./common-data";
import { DeepNonNullable, PropPath } from "./util";
import { PF1S } from "./config";

export declare class ActorPF extends Actor {
  /**
   * Final source details used for tooltips etc.
   */
  sourceDetails: SourceDetails;
  /**
   * Working object for sourceDetails
   */
  sourceInfo: SourceInfo;
}

export interface PF1ActorSpheresData {
  cl: ValueData<number> & MagicSpheresRecord;
  msb: ValueData<number>;
  msd: ValueData<number>;
  bab: CombatSpheresRecord;
}

type MagicSpheresRecord = {
  -readonly [Sphere in keyof typeof PF1S.magicSpheres]-?: TotalModData<number>;
};

type CombatSpheresRecord = {
  -readonly [Sphere in keyof typeof PF1S.combatSpheres]-?: TotalModData<number>;
};

/* PF1 Source Data */

export type PF1ActorDataSource = {
  type: "character" | "npc";
  data: PF1ActorDataSourceData;
};

export interface PF1ActorDataSourceData {
  attributes: AttributesSourceData;
}

interface AttributesSourceData {
  conditions: Record<Condition, boolean>;
}

/* PF1 Prepared Data */

export type PF1ActorDataProperties = {
  type: "character" | "npc";
  data: PF1ActorDataPropertiesData;
};

export interface PF1ActorDataPropertiesData extends PF1ActorDataSourceData {
  attributes: AttributesPropertiesData;

  /** Guaranteed to be complete after base data preparation */
  spheres: PF1ActorSpheresData | undefined;
}

interface AttributesPropertiesData extends AttributesSourceData {
  cmd: {
    total: number;
  };
}

type Condition = SphereCondition;
type SphereCondition = "battered";

/** A path pointing towards a property of an actor's data */
export type ActorDataPath = PropPath<DeepNonNullable<PF1ActorDataProperties>>;
