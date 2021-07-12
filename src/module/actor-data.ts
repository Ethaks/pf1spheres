import { ItemPF, SourceDetails, SourceInfo } from "./item-data";
import { TotalModData, ValueData } from "./common-data";
import { DeepNonNullable, PropPath } from "./util";
import { PF1S } from "./config";

export declare class ActorPF extends Actor {
  items: Collection<ItemPF>;
  data: PF1ActorData;
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

export interface PF1ActorData extends Actor.Data {
  data: PF1ActorDataData;
}

export interface PF1ActorDataData {
  attributes: {
    conditions: Record<Condition, boolean>;
    cmd: { total: number };
  };
  /** Guaranteed to be complete after base data preparation */
  spheres: PF1ActorSpheresData | undefined;
}

type Condition = SphereCondition;
type SphereCondition = "battered";

/** A path pointing towards a property of an actor's data */
export type ActorDataPath = PropPath<DeepNonNullable<PF1ActorData>>;
