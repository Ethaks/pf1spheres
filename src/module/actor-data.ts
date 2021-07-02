import { CombatSphere, ItemPF, SourceDetails, SourceInfo, MagicSphere } from "./item-data";
import { TotalModData, ValueData } from "./common-data";
import { PropPath } from "./util";

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
  cl: ValueData<number> & Record<MagicSphere, TotalModData<number>>;
  msb: ValueData<number>;
  msd: ValueData<number>;
  bab: Record<CombatSphere, TotalModData<number>>;
}

export interface PF1ActorData extends Actor.Data {
  //To account for pre-preparation data
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  data: PF1ActorDataData | Record<string, any>;
}

export interface PF1ActorDataData {
  attributes: {
    conditions: Record<Condition, boolean>;
    cmd: { total: number };
  };
  /** Guaranteed to be complete after base data preparation */
  spheres: PF1ActorSpheresData;
}

type Condition = SphereCondition;
type SphereCondition = "battered";

/** A path pointing towards a property of an actor's "data.data" */
export type ActorDataPath = PropPath<PF1ActorDataData, "data.">;
