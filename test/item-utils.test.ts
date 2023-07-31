/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import {
  isMagicSphere,
  isCombatSphere,
  getSphereType,
  getSphereDisplayName,
} from "../src/module/item-util";
import * as PF1S from "../src/module/config";
import { localize } from "../src/module/util";

describe("isMagicSphere", () => {
  it("should return true for creation", () => {
    expect(isMagicSphere("creation")).toBe(true);
  });
  it("should return true for destruction", () => {
    expect(isMagicSphere("destruction")).toBe(true);
  });

  it("should return true for all magic spheres", () => {
    for (const sphere of Object.keys(PF1S.magicSpheres)) {
      expect(isMagicSphere(sphere)).toBe(true);
    }
  });

  it("should return false for equipment", function () {
    expect(isMagicSphere("equipment")).toBe(false);
  });
  it("should return false for empty string", function () {
    expect(isMagicSphere("")).toBe(false);
  });
  it("should return false for a number", function () {
    // @ts-expect-error This is to test that the function returns false for numbers
    expect(isMagicSphere(1)).toBe(false);
  });
});

describe("isCombatSphere", function () {
  it("should return true for equipment", function () {
    expect(isCombatSphere("equipment")).toBe(true);
  });
  it("should return true for lancer", function () {
    expect(isCombatSphere("lancer")).toBe(true);
  });
  it("should return true for all combat spheres", function () {
    for (const sphere of Object.keys(PF1S.combatSpheres)) {
      expect(isCombatSphere(sphere)).toBe(true);
    }
  });

  it("should return false for conjuration", function () {
    expect(isCombatSphere("conjuration")).toBe(false);
  });
  it("should return false for empty string", function () {
    expect(isCombatSphere("")).toBe(false);
  });
});

describe("getSphereType", function () {
  it("should return 'magic' for fate", function () {
    expect(getSphereType("fate")).toBe("magic");
  });
  it("should return 'combat' for fencing", function () {
    expect(getSphereType("fencing")).toBe("combat");
  });
  it("should return undefined for empty string", function () {
    // @ts-expect-error This is to test that the function returns false for strings
    expect(getSphereType("")).toBeUndefined();
  });
  it("should return undefined for a number", function () {
    // @ts-expect-error This is to test that the function returns false for numbers
    expect(getSphereType(1)).toBeUndefined();
  });
});

describe("getSphereDisplayName", function () {
  it("should return 'Fate' for fate", function () {
    expect(localize(getSphereDisplayName("fate"))).toBe("Fate");
  });
  it("should return 'Guardian' for guardian", function () {
    expect(localize(getSphereDisplayName("guardian"))).toBe("Guardian");
  });
  it("should throw an error for empty string", function () {
    // @ts-expect-error This is to test that the function throws an error for strings
    expect(() => getSphereDisplayName("")).toThrow(`No display name found for ""`);
  });
});
