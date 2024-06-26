/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { DevUtils } from "./dev/utils";
import type { PackUtils } from "./dev";

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

export interface PF1ModuleData extends Game.ModuleData<foundry.packages.ModuleData> {
  api?: PF1SpheresApi;
}
export interface PF1SpheresApi {
  config: typeof pf1s.config;
  _internal: {
    packUtils: PackUtils | undefined;
    devUtils: DevUtils | undefined;
  };
}
