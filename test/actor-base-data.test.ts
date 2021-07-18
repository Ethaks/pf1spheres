import { onActorBasePreparation } from "../src/module/actor";
import { FakeSettings, getActor } from "./setup";

describe("Test actor snapshot data", () => {
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

describe("Test actor base data preparation with fractional base bonuses", () => {
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
});

describe("Test actor base data preparation without fractional base bonuses", () => {
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
});
