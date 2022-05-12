/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { ItemDataSource } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import type { ActorPF } from "../../src/module/actor-data";

export class FakeItem {
  _data: ItemDataSource;

  parent: ActorPF | null = null;

  constructor(data: ItemDataSource, options: { parent?: ActorPF } = {}) {
    this._data = JSON.parse(JSON.stringify(data));
    this.parent = options.parent ?? null;
  }

  get id(): string {
    return this.data._id as string;
  }

  get data() {
    return this._data;
  }

  toJSON() {
    return this._data;
  }
}
