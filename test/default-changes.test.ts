import { onAddDefaultChanges } from "../src/module/changes";
import { PF1S } from "../src/module/config";
import { ItemChange } from "../src/module/item-data";
import { localize } from "../src/module/util";
import { getActor } from "./setup";

describe("Test default changes handling", () => {
  // Setup actor and changes as data to be worked with
  const actor = getActor();
  const changes: ItemChange[] = [];

  // Get default changes
  onAddDefaultChanges(actor, changes);

  test("Battered change and source info", () => {
    // Condition
    expect(actor.data.data.attributes.conditions.battered).toBe(true);
    // Change
    expect(changes).toContainEqual({
      data: { formula: "-2", subTarget: "cmd", modifier: "untyped" },
    });
    // Source info
    expect(actor.sourceInfo["data.attributes.cmd.total"]?.negative).toContainEqual({
      name: localize("Battered"),
      value: -2,
    });
  });

  test("Basic BAB to Sphere BAB base", () => {
    expect(changes).toContainEqual({
      data: {
        formula: "@attributes.bab.total",
        subTarget: "~spherebabBase",
        modifier: "base",
      },
    });
  });

  test("MSB Base to Total", () => {
    expect(changes).toContainEqual({
      data: { formula: "@spheres.msb.base", subTarget: "msb", modifier: "base" },
    });
  });

  test("MSD Base to Total", () => {
    expect(changes).toContainEqual({
      data: { formula: "@spheres.msd.base", subTarget: "msd", modifier: "base" },
    });
  });

  test("ModCap to Total", () => {
    expect(changes).toContainEqual({
      data: {
        formula: "min(@attributes.hd.total, @spheres.cl.base + @spheres.cl.modCap)",
        subTarget: "spherecl",
        modifier: "untyped",
      },
    });
  });

  test("Each magic sphere's applicable CL bonus from base + modCap + sphereModCap", () => {
    for (const sphere of Object.keys(PF1S.magicSpheres)) {
      expect(changes).toContainEqual({
        data: {
          formula: `min(@attributes.hd.total, @spheres.cl.base + @spheres.cl.modCap + @spheres.cl.${sphere}.modCap) - @spheres.cl.base`,
          subTarget: `spherecl${sphere.capitalize()}`,
          modifier: "untyped",
        },
      });
    }
  });

  test("Dark sphere's applicable bonus to total", () => {
    expect(changes).toContainEqual({
      data: {
        formula:
          "min(@attributes.hd.total, @spheres.cl.base + @spheres.cl.modCap + @spheres.cl.dark.modCap) - @spheres.cl.base",
        subTarget: "sphereclDark",
        modifier: "untyped",
      },
    });
  });
});
