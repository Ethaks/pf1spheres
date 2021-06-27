import { ItemPF, SourceDetails, SourceInfo, Sphere } from "./item-data";
import { TotalModData, ValueData } from "./common-data";

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
  cl: ValueData<number> & Record<Sphere, TotalModData<number>>;
  msb: ValueData<number>;
  msd: ValueData<number>;
}

export interface PF1ActorData extends Actor.Data {
  data: PF1ActorDataData;
}

export interface PF1ActorDataData {
  attributes: {
    conditions: Record<Condition, boolean>;
  };
  spheres: PF1ActorSpheresData;
}

type Condition = SphereCondition;
type SphereCondition = "battered";
