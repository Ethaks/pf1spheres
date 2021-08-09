import { onGetChangeFlat } from "../src/module/changes";
import { PF1S } from "../src/module/config";
import { CombatSphere, SphereChangeTarget } from "../src/module/item-data";

describe("Test change target handling", () => {
  test("General Sphere CL", () => {
    const result = { keys: [] };
    onGetChangeFlat("spherecl", "untyped", result);
    expect(result.keys).toContain("data.spheres.cl.total");
    for (const sphere of Object.keys(PF1S.magicSpheres)) {
      expect(result.keys).toContain(`data.spheres.cl.${sphere}.total`);
    }
  });

  test("General Sphere CL, capped at HD", () => {
    const result = { keys: [] };
    onGetChangeFlat("spherecl", "sphereCLCap", result);
    expect(result.keys).toEqual(["data.spheres.cl.modCap"]);
  });

  test("MSB", () => {
    const result = { keys: [] };
    onGetChangeFlat("msb", "untyped", result);
    expect(result.keys).toEqual(["data.spheres.msb.total"]);
  });

  test("MSB Base", () => {
    const result = { keys: [] };
    onGetChangeFlat("msb", "untypedPerm", result);
    expect(result.keys).toEqual(["data.spheres.msb.base"]);
  });

  test("MSD", () => {
    const result = { keys: [] };
    onGetChangeFlat("msd", "untyped", result);
    expect(result.keys).toEqual(["data.spheres.msd.total"]);
  });

  test("MSD Base", () => {
    const result = { keys: [] };
    onGetChangeFlat("msd", "untypedPerm", result);
    expect(result.keys).toEqual(["data.spheres.msd.base"]);
  });

  test("Dark CL", () => {
    const result = { keys: [] };
    onGetChangeFlat("sphereclDark", "untyped", result);
    expect(result.keys).toEqual(["data.spheres.cl.dark.total"]);
  });

  test("Dark CL, capped at HD", () => {
    const result = { keys: [] };
    onGetChangeFlat("sphereclDark", "sphereCLCap", result);
    expect(result.keys).toEqual(["data.spheres.cl.dark.modCap"]);
  });

  test("Foreign CL", () => {
    const result = { keys: [] };
    onGetChangeFlat("cl" as SphereChangeTarget, "untyped", result);
    expect(result.keys.length).toBe(0);
  });

  test("Common BAB to Sphere BABs", () => {
    const result = { keys: [] };
    onGetChangeFlat("~spherebabBase", "untyped", result);
    for (const sphere of Object.keys(PF1S.combatSpheres) as CombatSphere[]) {
      expect(result.keys).toContain(`data.spheres.bab.${sphere}.total`);
    }
  });

  test("Duelist BAB", () => {
    const result = { keys: [] };
    onGetChangeFlat("spherebabDuelist", "untyped", result);
    expect(result.keys).toEqual(["data.spheres.bab.duelist.total"]);
  });
});
