/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import translations from "../public/lang/en.json";
import type { ActorDataPath } from "../src/module/actor-data";
import { FakeItemChange } from "./fakes";
import type { SourceInfo, SourceInfoEntry } from "../src/module/item-data";
import { FakeActor } from "./fakes/fake-actor";
import { FakeItem } from "./fakes/fake-item";

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
class Game {
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
    DicePF: class {
      static d20Roll() {
        return {};
      }
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
}

export function setup() {
  (global as any).Game = Game;

  (global as any).game = new Game();

  (global as any).Actor = FakeActor;
  (global as any).Item = FakeItem;

  (global as any).Hooks = class {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    static call() {}
  };

  (global as any).ui = {};

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

  (global as any).setProperty = setProperty;
}
setup();

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
