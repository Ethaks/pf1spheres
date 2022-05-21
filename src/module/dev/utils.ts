/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { ActorDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";
import type { ActorPF } from "../actor-data";
import type { ItemChangeCreateData } from "../item-data";
import { enforce, getGame } from "../util";

export interface DevUtils {
  createTestActor: () => Promise<undefined | void | ActorPF>;
  fetchPackEntryData: typeof fetchPackEntryData;
}

export const createTestActor = async ({ exportToJSON = false } = {}) => {
  const actorData: ActorDataConstructorData = {
    name: "Spheres Tester",
    type: "character",
    data: {
      attributes: { conditions: { battered: true } },
      abilities: {
        str: { value: 12 },
        dex: { value: 14 },
        con: { value: 16 },
        int: { value: 13 },
        wis: { value: 15 },
        cha: { value: 17 },
      },
    },
    items: [],
  };

  enforce(actorData.items);
  const race = await fetchPackEntryData("pf1.races", "Human");
  actorData.items.push(race);

  const classes: {
    name: string;
    level?: number;
    changes?: ItemChangeCreateData[];
    notes?: { text: string; subTarget: string }[];
  }[] = [
    {
      name: "Incanter",
      changes: [
        {
          formula: "1",
          operator: "add",
          subTarget: "spherecl",
          modifier: "sphereCLCap",
          priority: 0,
          value: 1,
        },
      ],
      notes: [{ text: "Incanter Note", subTarget: "msb" }],
    },
    {
      name: "Wraith",
      level: 2,
      changes: [
        {
          formula: "2",
          operator: "add",
          subTarget: "sphereclDark",
          modifier: "untyped",
          priority: 0,
          value: 2,
        },
      ],
      notes: [{ text: "Wraith Note", subTarget: "concentration" }],
    },
    {
      name: "Mageknight",
      level: 3,
      changes: [
        {
          formula: "12",
          operator: "add",
          subTarget: "spherebabAlchemy",
          modifier: "untyped",
          priority: 0,
          value: 12,
        },
      ],
    },
  ];
  for (const { name, changes = [], level = 1, notes = [] } of classes) {
    const data = await getClassData(name, { level, changes, notes });
    actorData.items.push(data);
  }

  const actor = await Actor.create(actorData);
  return exportToJSON ? actor?.exportToJSON() : actor;
};

export const fetchPackEntryData = async (packName: string, itemName: string) => {
  const pack = getGame().packs.get(packName);
  enforce(pack);
  const itemId = pack.index.find((d) => d.name === itemName)?._id;
  enforce(itemId);
  const item = (await pack.getDocument(itemId)) as StoredDocument<Item>;
  enforce(item);
  return item.toObject();
};

const getClassData = async (
  className: string,
  {
    level = 1,
    changes = [],
    notes = [],
  }: {
    level?: number | undefined;
    changes?: undefined | ItemChangeCreateData[];
    notes?: { text: string; subTarget: string }[];
  } = {}
) => {
  const classData = await fetchPackEntryData("pf1spheres.classes", className);
  enforce("level" in classData.data);
  classData.data.level = level;

  const ItemChange = getGame().pf1.documentComponents.ItemChange;
  classData.data.changes = changes.map((c) => {
    const change = ItemChange.create(c);
    const data = change.data;
    return data;
  });
  classData.data.contextNotes = notes;
  return classData;
};
