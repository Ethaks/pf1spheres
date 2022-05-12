/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { ActorDataSource } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";
import type { ActorPF } from "../../src/module/actor-data";
import type { ItemPF } from "../../src/module/item-data";
import { testActor } from "../test-actor";
import { FakeCollection } from "./fake-collection";
import { FakeItem } from "./fake-item";

export class FakeActor {
  sourceInfo = {};
  sourceDetails = {};
  items: FakeCollection<ItemPF> = new FakeCollection();
  _data: ActorDataSource;
  constructor(data: ActorDataSource) {
    this._data = JSON.parse(JSON.stringify(data));
    this.prepareData();
  }

  get data() {
    return this._data;
  }

  prepareData() {
    for (const source of this._data.items) {
      if (!source._id) continue;
      const item = this.items.get(source._id);
      if (item) {
        (item as unknown as FakeItem)._data = JSON.parse(JSON.stringify(source));
      } else {
        this.items.set(
          source._id,
          new FakeItem(source, { parent: this as unknown as ActorPF }) as unknown as ItemPF
        );
      }
    }
  }

  getRollData() {
    return JSON.parse(JSON.stringify(this.data));
  }

  formatContextNotes() {
    return [];
  }

  get allNotes() {
    return this.items
      .map((i) => ({
        item: i,
        // @ts-expect-error No proper definitiona for test-only property
        notes: (i.data.data.contextNotes as { text: string; subTarget: string }[]) ?? [],
      }))
      .filter((no) => no.notes.length > 0);
  }

  toJSON() {
    return this._data;
  }
}

/**
 * Returns a duplicated version of a fake actor built from test-actor.json data.
 * Although the return type is ActorPF, this is not a full actor!
 * Required fake data is determined on an as-needed basis.
 *
 * @returns A fake actor with a subset of available data
 */
export const getFakeActor = (options?: FakeActorOptions): ActorPF => {
  const actor = new FakeActor(testActor as ActorDataSource);
  if (options?.battered !== undefined)
    actor._data.data.attributes.conditions.battered = options.battered;

  return actor as unknown as ActorPF;
};

interface FakeActorOptions {
  battered?: boolean;
}
