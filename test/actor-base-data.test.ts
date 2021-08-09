import { ItemData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs";
import {
  getItemLevelData,
  ItemSphereClData,
  onActorBasePreparation,
  pushLevelSources,
} from "../src/module/actor";
import { ActorPF } from "../src/module/actor-data";
import { CasterProgression, PF1ClassDataSource } from "../src/module/item-data";
import { FakeSettings, getActor } from "./setup";

describe("Actor snapshot data", () => {
  // Initialise actor
  const actor = getActor();

  test("Actor has a class for each caster progression", () => {
    expect(actor.data.items).toContainEqual(
      expect.objectContaining({
        name: "Low-Caster",
        type: "class",
        flags: { pf1spheres: { casterProgression: "low" } },
      })
    );
    expect(actor.data.items).toContainEqual(
      expect.objectContaining({
        name: "Mid-Caster",
        type: "class",
        flags: { pf1spheres: { casterProgression: "mid" } },
      })
    );
    expect(actor.data.items).toContainEqual(
      expect.objectContaining({
        name: "High-Caster",
        type: "class",
        flags: { pf1spheres: { casterProgression: "high" } },
      })
    );
  });
});

describe("Actor base data preparation with fractional base bonuses", () => {
  // Initialise actor
  const actor = getActor();

  // Run data preparation
  onActorBasePreparation(actor);

  test("Base CL", () => {
    expect(actor.data.data.spheres?.cl.base).toEqual(4);
  });

  test("Base MSB", () => {
    expect(actor.data.data.spheres?.msb.base).toEqual(6);
  });

  test("Base MSD", () => {
    expect(actor.data.data.spheres?.msd.base).toEqual(17);
  });

  it("matches the snapshot", () => {
    const actorState = actor;
    expect(actorState).toMatchSnapshot();
  });
});

describe("Actor base data preparation without fractional base bonuses", () => {
  // Initialise actor
  const actor = getActor();

  // Turn of fractional base bonuses
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  ((game as any)._settings as FakeSettings).pf1.useFractionalBaseBonuses = false;

  // Run data preparation
  onActorBasePreparation(actor);

  test("Base CL", () => {
    expect(actor.data.data.spheres?.cl.base).toEqual(3);
  });

  it("matches the snapshot", () => {
    expect(actor).toMatchSnapshot();
  });
});

describe("Item level data calculation", () => {
  const classData = (
    progression: CasterProgression,
    level: number
  ): ItemData & PF1ClassDataSource =>
    ({
      name: `${progression.capitalize()} Caster Class`,
      type: "class",
      flags: { pf1spheres: { casterProgression: progression } },
      data: { level: level },
    } as ItemData & PF1ClassDataSource);

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
  const getFakeActor = (): ActorPF => ({ sourceInfo: {} } as ActorPF);
  const itemSphereData = (level: number, cl: number): ItemSphereClData => ({
    baseLevel: level,
    clPart: cl,
    name: `Class with level ${level} and CL ${cl}`,
  });

  const expectSource = (level: number, cl: number) => {
    pushSource(itemSphereData(level, cl));
    if (Boolean(level)) {
      expect(actor.sourceInfo["data.spheres.msb.base"]?.positive).toContainEqual({
        value: level,
        name: `Class with level ${level} and CL ${cl}`,
      });
      expect(actor.sourceInfo["data.spheres.msb.total"]?.positive).toContainEqual({
        value: level,
        name: `Class with level ${level} and CL ${cl}`,
      });
      expect(actor.sourceInfo["data.spheres.msd.base"]?.positive).toContainEqual({
        value: level,
        name: `Class with level ${level} and CL ${cl}`,
      });
      expect(actor.sourceInfo["data.spheres.msd.total"]?.positive).toContainEqual({
        value: level,
        name: `Class with level ${level} and CL ${cl}`,
      });
    } else {
      expect(actor.sourceInfo["data.spheres.msb.base"]).toBeUndefined();
      expect(actor.sourceInfo["data.spheres.msb.total"]).toBeUndefined();
      expect(actor.sourceInfo["data.spheres.msd.base"]).toBeUndefined();
      expect(actor.sourceInfo["data.spheres.msd.total"]).toBeUndefined();
    }
    if (Boolean(cl)) {
      expect(actor.sourceInfo["data.spheres.cl.base"]?.positive).toContainEqual({
        value: cl,
        name: `Class with level ${level} and CL ${cl}`,
      });
      expect(actor.sourceInfo["data.spheres.cl.total"]?.positive).toContainEqual({
        value: cl,
        name: `Class with level ${level} and CL ${cl}`,
      });
    } else {
      expect(actor.sourceInfo["data.spheres.cl.base"]).toBeUndefined();
      expect(actor.sourceInfo["data.spheres.cl.total"]).toBeUndefined();
    }
  };

  let actor: ActorPF, pushSource: (data: ItemSphereClData) => ItemSphereClData;

  beforeEach(() => {
    actor = getFakeActor();
    pushSource = pushLevelSources(actor);
  });

  test("Class with neither level nor CL", () => {
    pushSource(itemSphereData(0, 0));
    expect(actor.sourceInfo["data.spheres.msd.base"]).toBeUndefined();
  });
  // ESLint does not register the expects from expectSource
  /* eslint-disable jest/expect-expect */
  test("Caster with level 1 and CL 0", () => {
    expectSource(1, 0);
  });
  test("Caster with level 1 and CL 1", () => {
    expectSource(1, 1);
  });
  test("Caster with level 0 and CL 1 (not possible under normal circumstances)", () => {
    expectSource(0, 1);
  });
  /* eslint-enable jest/expect-expect */
});
