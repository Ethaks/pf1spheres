import translations from "../src/lang/en.json";
import { testActor } from "./test-actor";
import { ActorDataPath, ActorPF } from "../src/module/actor-data";
import { FakeItemChange } from "./fakes";
import { SourceInfo, SourceInfoEntry } from "../src/module/item-data";

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

/**
 * Returns a duplicated version of a fake actor built from test-actor.json data.
 * Although the return type is ActorPF, this is not a full actor!
 * Required fake data is determined on an as-needed basis.
 *
 * @returns A fake actor with a subset of available data
 */
export const getActor: () => ActorPF = () =>
  JSON.parse(
    JSON.stringify({
      data: testActor,
      items: testActor.items.map((i) => ({ data: i })),
      sourceInfo: {},
    })
  ) as unknown as ActorPF; // treat minimal fake actor as the real thing
