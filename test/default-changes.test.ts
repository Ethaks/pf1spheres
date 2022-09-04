/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { ActorPF } from "../src/module/actor-data";
import { onAddDefaultChanges } from "../src/module/changes";
import { PF1S } from "../src/module/config";
import type { ItemChange } from "../src/module/item-data";
import { localize } from "../src/module/util";
import { getFakeActor } from "./fakes/fake-actor";

let actor: ActorPF;
const changes: ItemChange[] = [];

beforeAll(() => {
  actor = getFakeActor();
  onAddDefaultChanges(actor, changes);
});

describe("Test default changes handling", () => {
  test("Battered change and source info", () => {
    // Condition
    expect(actor.system.attributes.conditions.battered).toBe(true);
    // Change
    expect(changes).toContainEqual({
      data: { formula: "-2", subTarget: "cmd", modifier: "untyped" },
    });
    // Source info
    expect(actor.sourceInfo["system.attributes.cmd.total"]?.negative).toContainEqual({
      name: localize("Battered"),
      value: -2,
    });
  });

  // This test uses its own actor instance to test an actor without the Battered condition
  test("No Battered condition", () => {
    const newActor = getFakeActor({ battered: false });
    const newChanges: ItemChange[] = [];
    onAddDefaultChanges(newActor, newChanges);
    expect(
      newChanges.find(
        (c) =>
          c.data.formula === "-2" && c.data.subTarget === "cmd" && c.data.modifier === "untyped"
      )
    ).toBeUndefined();
    expect(
      newActor.sourceInfo["system.attributes.cmd.total"]?.negative?.find(
        (c) => c.name === localize("Battered")
      )
    ).toBeUndefined();
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
        subTarget: "~spherecl",
        modifier: "untyped",
      },
    });
  });

  test("Each magic sphere's applicable CL bonus from base + modCap + sphereModCap", () => {
    for (const sphere of Object.keys(PF1S.magicSpheres)) {
      expect(changes).toContainEqual({
        data: {
          formula: `min(@attributes.hd.total, @spheres.cl.base + @spheres.cl.modCap + @spheres.cl.${sphere}.modCap)`,
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
          "min(@attributes.hd.total, @spheres.cl.base + @spheres.cl.modCap + @spheres.cl.dark.modCap)",
        subTarget: "sphereclDark",
        modifier: "untyped",
      },
    });
  });

  test("Magic Skill Bonus to Concentration change source info", () => {
    expect(changes).toContainEqual({
      data: {
        formula: "@spheres.msb.total",
        subTarget: "sphereConcentration",
        modifier: "untyped",
      },
    });
    expect(actor.sourceInfo["system.spheres.concentration.total"]?.positive).toContainEqual({
      name: "Magic Skill Bonus",
      formula: "@spheres.msb.total",
    });
  });

  test("Casting Ability change and source info", () => {
    expect(actor.flags.pf1spheres?.castingAbility).toBe("int");
    expect(changes).toContainEqual({
      data: {
        formula: "@abilities.int.mod",
        subTarget: "sphereConcentration",
        modifier: "untyped",
      },
    });
    expect(changes).toContainEqual({
      data: {
        formula: "@abilities.int.mod",
        subTarget: "~castingAbility",
        modifier: "untyped",
      },
    });

    expect(actor.sourceInfo["system.spheres.concentration.total"]?.positive).toContainEqual({
      name: `Casting Ability (Intelligence)`,
      formula: "@abilities.int.mod",
    });
  });

  test("No casting ability", () => {
    const newActor = getFakeActor({ castingAbility: "" });
    const newChanges: ItemChange[] = [];
    onAddDefaultChanges(newActor, newChanges);

    expect(newChanges).not.toContainEqual({
      data: {
        formula: "@abilities.int.mod",
        subTarget: "sphereConcentration",
        modifier: "untyped",
      },
    });
    expect(newChanges).not.toContainEqual({
      data: {
        formula: "@abilities.int.mod",
        subTarget: "~castingAbility",
        modifier: "untyped",
      },
    });
  });
});
