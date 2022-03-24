/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import translations from "../src/lang/en.json";
import { testActor } from "./test-actor";
import type { ActorDataPath, ActorPF } from "../src/module/actor-data";
import { FakeItemChange } from "./fakes";
import type { SourceInfo, SourceInfoEntry } from "../src/module/item-data";

/* eslint-disable @typescript-eslint/no-explicit-any */ // any will be used a lot in lieu of proper types

export interface FakeSettings extends Record<string, Record<string, any>> {
  pf1: {
    useFractionalBaseBonuses: boolean;
  };
}

/**
 * A minimal Game class providing only the functionality used by the module's
 * functions to be tested.
 */
(global as any).Game = class Game {
  private translations = translations;
  public _settings: FakeSettings = {
    pf1: {
      useFractionalBaseBonuses: true,
    },
  };
  public pf1 = {
    documentComponents: {
      ItemChange: FakeItemChange,
    },
    utils: {
      getSourceInfo: (obj: SourceInfo, key: ActorDataPath): SourceInfoEntry => {
        if (!obj[key]) {
          obj[key] = { negative: [], positive: [] };
        }
        return obj[key] as SourceInfoEntry;
      },
    },
  };
  public i18n = {
    format: (key: string, data: Record<string, any> = {}) => {
      let str = getProperty(this.translations, key) || key;
      const fmt = /\{[^\}]+\}/g;
      str = str.replace(fmt, (k: any) => {
        return data[k.slice(1, -1)];
      });
      return str;
    },
  };
  public settings = {
    get: <K extends string, S extends string>(key: K, setting: S): FakeSettings[K][S] =>
      this._settings[key][setting],
  };
};

// @ts-expect-error This Game class is only a Partial of the actual class
(global as any).game = new Game();

// @ts-expect-error It's what's provided by Foundry
String.prototype.capitalize = function () {
  if (!this.length) return this;
  return this.charAt(0).toUpperCase() + this.slice(1);
};

(global as any).CONFIG = {
  PF1: {
    buffTargets: {},
    stackingBonusModifiers: [],
  },
};

function getProperty(object: Record<string, any>, key: string): any | undefined {
  if (!key) return undefined;
  let target = object;
  for (const p of key.split(".")) {
    target = target || {};
    if (p in target) target = target[p as keyof typeof target];
    else return undefined;
  }
  return target;
}

function setProperty(object: Record<string, any>, key: string, value: unknown): boolean {
  let target = object;
  let changed = false;
  // Convert the key to an object reference if it contains dot notation
  if (key.indexOf(".") !== -1) {
    const parts = key.split(".");
    key = parts.pop() ?? "";
    target = parts.reduce((o, i) => {
      if (!(i in o)) o[i] = {};
      return o[i];
    }, object);
  }
  // Update the target
  if (target[key] !== value) {
    changed = true;
    target[key] = value;
  }
  // Return changed status
  return changed;
}
(global as any).setProperty = setProperty;

/**
 * Returns a duplicated version of a fake actor built from test-actor.json data.
 * Although the return type is ActorPF, this is not a full actor!
 * Required fake data is determined on an as-needed basis.
 *
 * @returns A fake actor with a subset of available data
 */
export const getActor: (options?: FakeActorOptions) => ActorPF = (options = {}) => {
  const actor = JSON.parse(
    JSON.stringify({
      data: testActor,
      items: testActor.items.map((i) => ({ data: i })),
      sourceInfo: {},
    })
  ) as unknown as ActorPF; // treat minimal fake actor as the real thing

  if (options.battered != null) actor.data.data.attributes.conditions.battered = options.battered;

  return actor;
};

interface FakeActorOptions {
  battered?: boolean;
}
