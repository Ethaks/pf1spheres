/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import { onGetChangeFlat } from "../src/module/changes";
import * as PF1S from "../src/module/config";
import type { CombatSphere, SphereChangeTarget } from "../src/module/item-data";
import type { ActorDataPath } from "../src/module/actor-data";

describe("Test change target handling", () => {
  test("General Sphere CL", () => {
    const result: ActorDataPath[] = [];
    onGetChangeFlat(result, "spherecl", "untyped");
    expect(result).toContain("system.spheres.cl.total");
    for (const sphere of Object.keys(PF1S.magicSpheres)) {
      expect(result).toContain(`system.spheres.cl.${sphere}.total`);
    }
  });

  test("General Sphere CL to each sphere", () => {
    const result: ActorDataPath[] = [];
    onGetChangeFlat(result, "spherecl", "untyped");
    for (const sphere of Object.keys(PF1S.magicSpheres)) {
      expect(result).toContain(`system.spheres.cl.${sphere}.total`);
    }
  });

  test("General Sphere CL, capped at HD", () => {
    const result: ActorDataPath[] = [];
    onGetChangeFlat(result, "spherecl", "sphereCLCap");
    expect(result).toEqual(["system.spheres.cl.modCap"]);
  });

  test("MSB", () => {
    const result: ActorDataPath[] = [];
    onGetChangeFlat(result, "msb", "untyped");
    expect(result).toEqual(["system.spheres.msb.total"]);
  });

  test("MSB Base", () => {
    const result: ActorDataPath[] = [];
    onGetChangeFlat(result, "msb", "untypedPerm");
    expect(result).toEqual(["system.spheres.msb.base"]);
  });

  test("MSD", () => {
    const result: ActorDataPath[] = [];
    onGetChangeFlat(result, "msd", "untyped");
    expect(result).toEqual(["system.spheres.msd.total"]);
  });

  test("MSD Base", () => {
    const result: ActorDataPath[] = [];
    onGetChangeFlat(result, "msd", "untypedPerm");
    expect(result).toEqual(["system.spheres.msd.base"]);
  });

  test("Dark CL", () => {
    const result: ActorDataPath[] = [];
    onGetChangeFlat(result, "sphereclDark", "untyped");
    expect(result).toEqual(["system.spheres.cl.dark.total"]);
  });

  test("Dark CL, capped at HD", () => {
    const result: ActorDataPath[] = [];
    onGetChangeFlat(result, "sphereclDark", "sphereCLCap");
    expect(result).toEqual(["system.spheres.cl.dark.modCap"]);
  });

  test("Foreign CL", () => {
    const result: ActorDataPath[] = [];
    onGetChangeFlat(result, "cl" as SphereChangeTarget, "untyped");
    expect(result.length).toBe(0);
  });

  test("Common BAB to Sphere BABs", () => {
    const result: ActorDataPath[] = [];
    onGetChangeFlat(result, "~spherebabBase", "untyped");
    for (const sphere of Object.keys(PF1S.combatSpheres) as CombatSphere[]) {
      expect(result).toContain(`system.spheres.bab.${sphere}.total`);
    }
  });

  test("Duelist BAB", () => {
    const result: ActorDataPath[] = [];
    onGetChangeFlat(result, "spherebabDuelist", "untyped");
    expect(result).toEqual(["system.spheres.bab.duelist.total"]);
  });
});
