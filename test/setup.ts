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
import { FakeRoll } from "./fakes/fake-roll";
import { FakeChatMessage } from "./fakes/fake-message";
import type { D20ActorRollOptions } from "../src/pf1-types/d20roll";
import * as PF1S from "../src/module/config";

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
  (global as any).RollPF = FakeRoll;
  (global as any).ChatMessage = FakeChatMessage;

  (global as any).Hooks = class {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    static call() {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    static callAll() {}
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
      stackingBonusTypes: [],
      abilities: { int: "Intelligence" },
      bonusTypes: {},
    },
  };

  (global as any).pf1 = {
    components: {
      ItemChange: FakeItemChange,
    },
    dice: {
      d20Roll: (_options: D20ActorRollOptions = {}) => undefined,
    },
    documents: {
      actor: {
        changes: {
          getSourceInfo: (obj: SourceInfo, key: ActorDataPath): SourceInfoEntry => {
            if (!obj[key]) {
              obj[key] = { negative: [], positive: [] };
            }
            return obj[key] as SourceInfoEntry;
          },
        },
      },
    },
  };

  (global as any).pf1s = {
    config: PF1S,
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
