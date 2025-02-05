/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { ActorDataSource } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";
import type { Ability, ActorDataPath, ActorPF } from "../../src/module/actor-data";
import type { ItemPF, SourceInfo } from "../../src/module/item-data";
import { FakeCollection } from "./fake-collection";
import { FakeItem } from "./fake-item";
import testActor from "../test-actor.json";
import { ContextNoteObject } from "../../src/module/actor-methods";

export class FakeActor {
  sourceInfo: SourceInfo = {};
  sourceDetails = {};
  items = new FakeCollection<ItemPF>();
  _data: ActorDataSource;
  constructor(data: ActorDataSource) {
    this._data = JSON.parse(JSON.stringify(data));
    this.prepareData();
  }

  // Begin v10 hack
  get system() {
    return this._data.system;
  }
  get flags() {
    return this._data.flags;
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
          new FakeItem(source, { parent: this as unknown as ActorPF }) as unknown as ItemPF,
        );
      }
    }
  }

  getRollData() {
    return JSON.parse(JSON.stringify(this.system));
  }

  getSourceDetails(path: ActorDataPath) {
    // Return all positive and negative sources
    const info = this.sourceInfo[path] ?? { positive: [], negative: [] };
    return [...info.positive, ...info.negative];
  }

  async enrichContextNotes(noteObjects: ContextNoteObject[], _rollData: unknown): Promise<void> {
    for (const note of noteObjects) {
      note.enriched = note.notes;
    }
  }

  get allNotes() {
    return this.items
      .map((i) => ({
        item: i,
        notes: i.system.contextNotes ?? [],
      }))
      .filter((no) => no.notes.length > 0);
  }

  toJSON() {
    return this._data;
  }
  toObject() {
    return this.toJSON();
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
  const actor = new FakeActor(testActor as unknown as ActorDataSource);
  if (options?.battered !== undefined)
    actor._data.system.attributes.conditions.battered = options.battered;

  if (options?.castingAbility !== undefined)
    setProperty(actor._data, "flags.pf1spheres.castingAbility", options.castingAbility);

  return actor as unknown as ActorPF;
};

interface FakeActorOptions {
  battered?: boolean;
  castingAbility?: Ability | "";
}
