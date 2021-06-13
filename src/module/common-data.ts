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

export interface TotalModData<T> extends ModifiableData<T>, TotalData<T>, CappedModifiableData<T> {}

export interface ValueData<T>
  extends BaseData<T>,
    ModifiableData<T>,
    TotalData<T>,
    CappedModifiableData<T> {}
