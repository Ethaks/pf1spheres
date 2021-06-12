import { onGetChangeFlat } from "../src/module/changes";
import { SphereChangeTarget } from "../src/module/item-data";

describe("Test change target handling", () => {
  test("General Sphere CL", () => {
    const result = { keys: [] };
    onGetChangeFlat("spherecl", "untyped", result);
    expect(result.keys).toContain("data.spheres.cl.mod");
  });

  test("General Sphere CL, capped at HD", () => {
    const result = { keys: [] };
    onGetChangeFlat("spherecl", "sphereCLCap", result);
    expect(result.keys).toContain("data.spheres.cl.modCap");
  });

  test("MSB", () => {
    const result = { keys: [] };
    onGetChangeFlat("msb", "untyped", result);
    expect(result.keys).toContain("data.spheres.msb.mod");
  });

  test("MSD", () => {
    const result = { keys: [] };
    onGetChangeFlat("msd", "untyped", result);
    expect(result.keys).toContain("data.spheres.msd.mod");
  });

  test("Dark CL", () => {
    const result = { keys: [] };
    onGetChangeFlat("sphereclDark", "untyped", result);
    expect(result.keys).toContain("data.spheres.cl.dark.mod");
  });

  test("Dark CL, capped at HD", () => {
    const result = { keys: [] };
    onGetChangeFlat("sphereclDark", "sphereCLCap", result);
    expect(result.keys).toContain("data.spheres.cl.dark.modCap");
  });

  test("Foreign CL", () => {
    const result = { keys: [] };
    onGetChangeFlat("cl" as SphereChangeTarget, "untyped", result);
    expect(result.keys.length).toBe(0);
  });
});
