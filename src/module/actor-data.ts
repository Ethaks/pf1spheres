import { ItemPF, SourceDetails, SourceInfo, Sphere } from "./item-data";
import { TotalModData, ValueData } from "./common-data";

export declare class ActorPF extends Actor {
  items: Collection<ItemPF>;
  data: PF1ActorData;
  sourceDetails: SourceDetails;
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
}

type Condition = SphereCondition;
type SphereCondition = "battered";
