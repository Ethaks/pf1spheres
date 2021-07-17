import { PF1S } from "./config";

export interface BaseData<T> {
  base: T;
}

export interface ModifiableData<T> {
  mod: T;
}

export interface TotalData<T> {
  total: T;
}

export interface CappedModifiableData<T> {
  modCap: T;
}

export interface TotalModData<T> extends TotalData<T>, CappedModifiableData<T> {}

export interface ValueData<T> extends BaseData<T>, TotalData<T>, CappedModifiableData<T> {}

export interface PF1SpheresApi {
  config: typeof PF1S;
}
