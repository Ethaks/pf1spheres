/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { ActorDataSource } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";
import type { ItemDataSource } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import type { ItemChangeCreateData } from "../src/module/item-data";

export type FakeActorDataSource = Omit<ActorDataSource, "_id" | "folder" | "permission"> & {
  items: FakeItemDataSource[];
  type: string;
  data: {
    abilities: Record<string, unknown>;
    attributes: {
      conditions: Record<string, boolean>;
    } & Record<string, unknown>;
  } & Record<string, unknown>;
};

export type FakeItemDataSource = Omit<ItemDataSource, "folder" | "permission">;

export class FakeItemChange {
  public data: ItemChangeCreateData;
  constructor(data: ItemChangeCreateData) {
    this.data = data;
  }
  static create(data: ItemChangeCreateData): FakeItemChange {
    const result = new this(data);
    return result;
  }
}
