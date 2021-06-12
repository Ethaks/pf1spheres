import { Sphere } from "./item-data";
import { TotalModData, ValueData } from "./common-data";

export interface PF1ActorSpheresData {
  cl: ValueData<number> & Record<Sphere, TotalModData<number>>;
  msb: ValueData<number>;
  msd: ValueData<number>;
}
