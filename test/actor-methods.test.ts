/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import { onActorBasePreparation } from "../src/module/actor";
import type { ActorPF } from "../src/module/actor-data";
import { getGame } from "../src/module/util";
import { getFakeActor } from "./fakes/fake-actor";

beforeAll(() => {
  vi.stubGlobal("MouseEvent", class {});
  vi.stubGlobal(
    "ChatMessage",
    class {
      static getSpeaker() {
        return {};
      }
    }
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
    actor.sourceDetails["data.spheres.msb.total"] = [{ value: 1, name: "Base" }];

    const hookSpy = vi.spyOn(Hooks, "call").mockImplementation(() => true);
    const d20RollSpy = vi.spyOn(getGame().pf1.DicePF, "d20Roll");

    await actor.spheres.rollMsb();

    expect(hookSpy).toHaveBeenCalledOnce();
    expect(hookSpy).toHaveBeenCalledWith("actorRoll", actor, "msb", null, {});
    expect(d20RollSpy).toHaveBeenCalledOnce();
    expect(d20RollSpy).toHaveBeenCalledWith({
      event: {},
      fastForward: undefined,
      parts: "1[Base]",
      dice: undefined,
      data: actor.data,
      title: "Magic Skill Check",
      speaker: {},
      subject: { pf1spheres: "msb" },
      chatTemplate: "systems/pf1/templates/chat/roll-ext.hbs",
      chatTemplateData: { hasProperties: false, properties: [] },
      chatMessage: true,
      noSound: false,
      originalOptions: {},
    });
  });

  test("should not work without owner permissions", async () => {
    // @ts-expect-error Only for test
    actor.isOwner = false;
    const hookSpy = vi.spyOn(Hooks, "call").mockImplementation(() => true);
    const d20RollSpy = vi.spyOn(getGame().pf1.DicePF, "d20Roll");

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
    actor.sourceDetails["data.spheres.concentration.total"] = [
      { value: 1, name: "Magic Skill Bonus" },
      { value: 2, name: "Buff" },
    ];

    const hookSpy = vi.spyOn(Hooks, "call").mockImplementation(() => true);
    const d20RollSpy = vi.spyOn(getGame().pf1.DicePF, "d20Roll");

    await actor.spheres.rollConcentration();

    expect(hookSpy).toHaveBeenCalledOnce();
    expect(hookSpy).toHaveBeenCalledWith("actorRoll", actor, "concentration", null, {});
    expect(d20RollSpy).toHaveBeenCalledOnce();
    expect(d20RollSpy).toHaveBeenCalledWith({
      event: {},
      fastForward: undefined,
      parts: "1[Magic Skill Bonus]+2[Buff]",
      dice: undefined,
      data: actor.data,
      title: "PF1.ConcentrationCheck",
      speaker: {},
      subject: { pf1spheres: "concentration" },
      chatTemplate: "systems/pf1/templates/chat/roll-ext.hbs",
      chatTemplateData: { hasProperties: false, properties: [] },
      chatMessage: true,
      noSound: false,
      originalOptions: {},
    });
  });

  test("should not work without owner permissions", async () => {
    // @ts-expect-error Only for test
    actor.isOwner = false;
    const hookSpy = vi.spyOn(Hooks, "call").mockImplementation(() => true);
    const d20RollSpy = vi.spyOn(getGame().pf1.DicePF, "d20Roll");

    const result = await actor.spheres.rollConcentration();
    expect(result).toBeUndefined();
    expect(hookSpy).not.toHaveBeenCalled();
    expect(d20RollSpy).not.toHaveBeenCalled();
  });
});
