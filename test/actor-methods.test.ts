/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import { onActorBasePreparation } from "../src/module/actor";
import type { ActorPF } from "../src/module/actor-data";
import { getFakeActor } from "./fakes/fake-actor";

beforeAll(() => {
  vi.stubGlobal("MouseEvent", class {});
  vi.stubGlobal(
    "ChatMessage",
    class {
      static getSpeaker() {
        return {};
      }
    },
  );
});

const getActor = () => {
  const actor = getFakeActor();
  onActorBasePreparation(actor);
  // @ts-expect-error Only for tests
  actor.isOwner = true;
  return actor;
};

describe("Actor#spheres#rollMsb", () => {
  let actor: ActorPF;

  beforeEach(() => {
    actor = getActor();
  });

  test("with default parameters rolls a ChatMessage", async () => {
    actor.sourceDetails["system.spheres.msb.total"] = [{ value: 1, name: "Base" }];

    const callHookSpy = vi.spyOn(Hooks, "call").mockImplementation(() => true);
    // @ts-expect-error Only for tests
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const callAllHookSpy = vi.spyOn(Hooks, "callAll").mockImplementation(() => {});
    const d20RollSpy = vi.spyOn(pf1.dice, "d20Roll");

    const result = await actor.spheres.rollMsb();

    const rollOptions = {
      skipDialog: undefined,
      parts: ["1[Base]"],
      rollData: actor.system,
      flavor: "Magic Skill Check",
      speaker: {},
      subject: { pf1spheres: "msb" },
      chatTemplateData: { hasProperties: false, properties: [] },
    };

    expect(callHookSpy).toHaveBeenCalledOnce();
    expect(callHookSpy).toHaveBeenCalledWith("pf1spheresPreActorRollMsb", actor, rollOptions);
    expect(d20RollSpy).toHaveBeenCalledOnce();
    expect(d20RollSpy).toHaveBeenCalledWith(rollOptions);
    expect(callAllHookSpy).toHaveBeenCalledOnce();
    expect(callAllHookSpy).toHaveBeenCalledWith("pf1spheresActorRollMsb", actor, result);
  });

  test("should not work without owner permissions", async () => {
    // @ts-expect-error Only for test
    actor.isOwner = false;
    const hookSpy = vi.spyOn(Hooks, "call").mockImplementation(() => true);
    const d20RollSpy = vi.spyOn(pf1.dice, "d20Roll");

    const result = await actor.spheres.rollMsb();
    expect(result).toBeUndefined();
    expect(hookSpy).not.toHaveBeenCalled();
    expect(d20RollSpy).not.toHaveBeenCalled();
  });
});

describe("Actor#spheres#rollConcentration", () => {
  let actor: ActorPF;

  beforeEach(() => {
    actor = getActor();
  });

  test("with default parameters rolls a ChatMessage", async () => {
    actor.sourceDetails["system.spheres.concentration.total"] = [
      { value: 1, name: "Magic Skill Bonus" },
      { value: 2, name: "Buff" },
    ];

    const callHookSpy = vi.spyOn(Hooks, "call").mockImplementation(() => true);
    // @ts-expect-error Only for tests
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const callAllhookSpy = vi.spyOn(Hooks, "callAll").mockImplementation(() => {});
    const d20RollSpy = vi.spyOn(pf1.dice, "d20Roll");

    const result = await actor.spheres.rollConcentration();

    const rollOptions = {
      skipDialog: undefined,
      parts: ["1[Magic Skill Bonus]", "2[Buff]"],
      rollData: actor.system,
      flavor: "PF1.ConcentrationCheck",
      speaker: {},
      subject: { pf1spheres: "concentration" },
      chatTemplateData: { hasProperties: false, properties: [] },
    };

    expect(callHookSpy).toHaveBeenCalledOnce();
    expect(callHookSpy).toHaveBeenCalledWith(
      "pf1spheresPreActorRollConcentration",
      actor,
      rollOptions,
    );
    expect(d20RollSpy).toHaveBeenCalledOnce();
    expect(d20RollSpy).toHaveBeenCalledWith(rollOptions);
    expect(callAllhookSpy).toHaveBeenCalledOnce();
    expect(callAllhookSpy).toHaveBeenCalledWith("pf1spheresActorRollConcentration", actor, result);
  });

  test("should not work without owner permissions", async () => {
    // @ts-expect-error Only for test
    actor.isOwner = false;
    const hookSpy = vi.spyOn(Hooks, "call").mockImplementation(() => true);
    const d20RollSpy = vi.spyOn(pf1.dice, "d20Roll");

    const result = await actor.spheres.rollConcentration();
    expect(result).toBeUndefined();
    expect(hookSpy).not.toHaveBeenCalled();
    expect(d20RollSpy).not.toHaveBeenCalled();
  });
});
