/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import { registerChanges } from "../src/module/changes";

describe("Sphere-specific change registration", () => {
  registerChanges();

  it("should register Creation sphere CL", () => {
    expect(CONFIG.PF1.buffTargets.sphereclCreation).toBeDefined();
  });

  it("should register Alchemy sphere BAB", () => {
    expect(CONFIG.PF1.buffTargets.spherebabAlchemy).toBeDefined();
  });

  it("should register sphereCLCap as stacking modifier", () => {
    expect(CONFIG.PF1.stackingBonusModifiers).toContain("sphereCLCap");
  });
});
