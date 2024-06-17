/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { ItemSphereClData } from "../src/module/actor";
import {
  filterClasses,
  getItemLevelData,
  onActorBasePreparation,
  pushLevelSources,
} from "../src/module/actor";
import type { ActorPF } from "../src/module/actor-data";
import * as PF1S from "../src/module/config";
import type { CasterProgression, ItemPF, PF1ClassDataSource } from "../src/module/item-data";
import { getFakeActor } from "./fakes/fake-actor";
import type { FakeSettings } from "./setup";

const classData = (progression: CasterProgression, level: number): ItemPF & PF1ClassDataSource =>
  ({
    // @ts-expect-error Type instantiation should be checked with v10 types
    name: `${progression.capitalize()} Caster Class`,
    type: "class",
    flags: { pf1spheres: { casterProgression: progression } },
    system: { level: level },
  }) as ItemPF & PF1ClassDataSource;

describe("Actor snapshot data", () => {
  // Initialise actor
  const actor = getFakeActor();

  test("Actor has a class for each caster progression", () => {
    expect(actor.toObject().items).toContainEqual(
      expect.objectContaining({
        name: "Mageknight",
        type: "class",
        flags: { pf1spheres: { casterProgression: "low" } },
      }),
    );
    expect(actor.toObject().items).toContainEqual(
      expect.objectContaining({
        name: "Wraith",
        type: "class",
        flags: { pf1spheres: { casterProgression: "mid" } },
      }),
    );
    expect(actor.toObject().items).toContainEqual(
      expect.objectContaining({
        name: "Incanter",
        type: "class",
        flags: { pf1spheres: { casterProgression: "high" } },
      }),
    );
  });
});

describe("Actor base data preparation with fractional base bonuses", () => {
  // Initialise actor
  const actor = getFakeActor();

  // Run data preparation
  onActorBasePreparation(actor);

  test("Base CL", () => {
    expect(actor.system.spheres?.cl.base).toEqual(4);
  });

  test("Base MSB", () => {
    expect(actor.system.spheres?.msb.base).toEqual(6);
  });

  test("Base MSD", () => {
    expect(actor.system.spheres?.msd.base).toEqual(17);
  });

  it("matches the snapshot", () => {
    expect(actor).toMatchSnapshot();
  });
});

describe("Actor base data preparation without fractional base bonuses", () => {
  // Initialise actor
  const actor = getFakeActor();

  // Turn of fractional base bonuses
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  ((game as any)._settings as FakeSettings).pf1.useFractionalBaseBonuses = false;

  // Run data preparation
  onActorBasePreparation(actor);

  test("Base CL", () => {
    expect(actor.system.spheres?.cl.base).toEqual(3);
  });

  it("matches the snapshot", () => {
    expect(actor).toMatchSnapshot();
  });
});

describe("Filter valid sphere caster classes", () => {
  it("should not be valid", () => {
    expect(filterClasses(classData("", 10))).toBeFalsy();
  });

  it("should be valid", () => {
    expect(filterClasses(classData("low", 10))).toBeTruthy();
  });
});

describe("Item level data calculation", () => {
  const getFractionalLevel = getItemLevelData(true);
  const getNormalLevel = getItemLevelData(false);

  test("None without fractional BAB", () => {
    expect(getNormalLevel(classData("", 5))).toMatchObject({ baseLevel: 5, clPart: 0 });
  });
  test("Low without fractional BAB", () => {
    expect(getNormalLevel(classData("low", 5))).toMatchObject({ baseLevel: 5, clPart: 2 });
  });
  test("Mid without fractional BAB", () => {
    expect(getNormalLevel(classData("mid", 5))).toMatchObject({ baseLevel: 5, clPart: 3 });
  });
  test("High without fractional BAB", () => {
    expect(getNormalLevel(classData("high", 5))).toMatchObject({ baseLevel: 5, clPart: 5 });
  });
  // TODO: Finish tests
  test("Formulaic without fractional BAB", () => {
    for (const progression of Object.keys(PF1S.progression)) {
      const multiplier = PF1S.progressionFormula[progression];
      for (let i = 1; i < 21; i++) {
        expect(getNormalLevel(classData(progression, i))).toMatchObject({
          baseLevel: i,
          clPart: Math.floor(i * multiplier),
        });
      }
    }
  });

  test("None with fractional BAB", () => {
    expect(getFractionalLevel(classData("", 5))).toMatchObject({ baseLevel: 5, clPart: 0 });
  });
  test("Low with fractional BAB", () => {
    expect(getFractionalLevel(classData("low", 5))).toMatchObject({ baseLevel: 5, clPart: 2.5 });
  });
  test("Mid with fractional BAB", () => {
    expect(getFractionalLevel(classData("mid", 5))).toMatchObject({ baseLevel: 5, clPart: 3.75 });
  });
  test("High with fractional BAB", () => {
    expect(getFractionalLevel(classData("high", 5))).toMatchObject({ baseLevel: 5, clPart: 5 });
  });
});

describe("Source tracking for Sphere CL, MSB/D", () => {
  const getFakeActor = (): ActorPF => ({ sourceInfo: {} }) as ActorPF;
  const itemSphereData = (level: number, cl: number): ItemSphereClData => ({
    baseLevel: level,
    clPart: cl,
    name: `Class with level ${level} and CL ${cl}`,
  });

  const expectSource = (level: number, cl: number) => {
    pushSource(itemSphereData(level, cl));
    if (Boolean(level)) {
      expect(actor.sourceInfo["system.spheres.msb.base"]?.positive).toContainEqual({
        value: level,
        type: "untyped",
        name: `Class with level ${level} and CL ${cl}`,
      });
      expect(actor.sourceInfo["system.spheres.msb.total"]?.positive).toContainEqual({
        value: level,
        type: "untyped",
        name: `Class with level ${level} and CL ${cl}`,
      });
      expect(actor.sourceInfo["system.spheres.msd.base"]?.positive).toContainEqual({
        value: level,
        type: "untyped",
        name: `Class with level ${level} and CL ${cl}`,
      });
      expect(actor.sourceInfo["system.spheres.msd.total"]?.positive).toContainEqual({
        value: level,
        type: "untyped",
        name: `Class with level ${level} and CL ${cl}`,
      });
    } else {
      expect(actor.sourceInfo["system.spheres.msb.base"]).toBeUndefined();
      expect(actor.sourceInfo["system.spheres.msb.total"]).toBeUndefined();
      expect(actor.sourceInfo["system.spheres.msd.base"]).toBeUndefined();
      expect(actor.sourceInfo["system.spheres.msd.total"]).toBeUndefined();
    }
    if (Boolean(cl)) {
      expect(actor.sourceInfo["system.spheres.cl.base"]?.positive).toContainEqual({
        value: cl,
        type: "untyped",
        name: `Class with level ${level} and CL ${cl}`,
      });
      expect(actor.sourceInfo["system.spheres.cl.total"]?.positive).toContainEqual({
        value: cl,
        type: "untyped",
        name: `Class with level ${level} and CL ${cl}`,
      });
    } else {
      expect(actor.sourceInfo["system.spheres.cl.base"]).toBeUndefined();
      expect(actor.sourceInfo["system.spheres.cl.total"]).toBeUndefined();
    }
  };

  let actor: ActorPF, pushSource: (data: ItemSphereClData) => ItemSphereClData;

  beforeEach(() => {
    actor = getFakeActor();
    pushSource = pushLevelSources(actor);
  });

  test("Class with neither level nor CL", () => {
    pushSource(itemSphereData(0, 0));
    expect(actor.sourceInfo["system.spheres.msd.base"]).toBeUndefined();
  });
  // ESLint does not register the expects from expectSource
  test("Caster with level 1 and CL 0", () => {
    expectSource(1, 0);
  });
  test("Caster with level 1 and CL 1", () => {
    expectSource(1, 1);
  });
  test("Caster with level 0 and CL 1 (not possible under normal circumstances)", () => {
    expectSource(0, 1);
  });
});
