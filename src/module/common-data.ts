/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { changeFlatTargets } from "./changes";
import type { PF1S } from "./config";
import type * as packUtils from "./pack-util";

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
  config: typeof PF1S;
  changeFlatTargets: typeof changeFlatTargets;
  _internal: {
    packUtils: typeof packUtils;
  };
}
