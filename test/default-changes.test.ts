/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { ActorPF } from "../src/module/actor-data";
import { onAddDefaultChanges } from "../src/module/changes";
import * as PF1S from "../src/module/config";
import type { ItemChange } from "../src/module/item-data";
import { getFakeActor } from "./fakes/fake-actor";

let actor: ActorPF;
const changes: ItemChange[] = [];

beforeAll(() => {
  actor = getFakeActor();
  onAddDefaultChanges(actor, changes);
});

describe("Test default changes handling", () => {
  test("Basic BAB to Sphere BAB base", () => {
    expect(changes).toContainEqual({
      data: {
        formula: "@attributes.bab.total",
        target: "~spherebabBase",
        modifier: "base",
      },
    });
  });

  test("MSB Base to Total", () => {
    expect(changes).toContainEqual({
      data: { formula: "@spheres.msb.base", target: "msb", modifier: "base" },
    });
  });

  test("MSD Base to Total", () => {
    expect(changes).toContainEqual({
      data: { formula: "@spheres.msd.base", target: "msd", modifier: "base" },
    });
  });

  test("ModCap to Total", () => {
    expect(changes).toContainEqual({
      data: {
        formula: "min(@attributes.hd.total, @spheres.cl.base + @spheres.cl.modCap)",
        target: "~spherecl",
        modifier: "untyped",
      },
    });
  });

  test("Each magic sphere's applicable CL bonus from base + modCap + sphereModCap", () => {
    for (const sphere of Object.keys(PF1S.magicSpheres)) {
      expect(changes).toContainEqual({
        data: {
          formula: `min(@attributes.hd.total, @spheres.cl.base + @spheres.cl.modCap + @spheres.cl.${sphere}.modCap)`,
          target: `spherecl${sphere.capitalize()}`,
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
        target: "sphereclDark",
        modifier: "untyped",
      },
    });
  });

  test("Magic Skill Bonus to Concentration change source info", () => {
    expect(changes).toContainEqual({
      data: {
        formula: "@spheres.msb.total",
        target: "sphereConcentration",
        modifier: "untyped",
        flavor: "Magic Skill Bonus",
      },
    });
  });

  test("Casting Ability change and source info", () => {
    expect(actor.flags.pf1spheres?.castingAbility).toBe("int");
    expect(changes).toContainEqual({
      data: {
        formula: "@abilities.int.mod",
        target: "sphereConcentration",
        modifier: "untyped",
        flavor: "Casting Ability (Intelligence)",
      },
    });
    expect(changes).toContainEqual({
      data: {
        formula: "@abilities.int.mod",
        target: "~castingAbility",
        modifier: "untyped",
        flavor: "Casting Ability (Intelligence)",
      },
    });
  });

  test("No casting ability", () => {
    const newActor = getFakeActor({ castingAbility: "" });
    const newChanges: ItemChange[] = [];
    onAddDefaultChanges(newActor, newChanges);

    expect(newChanges).not.toContainEqual({
      data: {
        formula: "@abilities.int.mod",
        target: "sphereConcentration",
        modifier: "untyped",
      },
    });
    expect(newChanges).not.toContainEqual({
      data: {
        formula: "@abilities.int.mod",
        target: "~castingAbility",
        modifier: "untyped",
      },
    });
  });
});
