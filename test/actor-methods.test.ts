/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import { onActorBasePreparation } from "../src/module/actor";
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
  return actor;
};

describe("Actor#rollMsb", () => {
  test("with defautl parameters rolls a ChatMessage", async () => {
    const actor = getActor();
    // @ts-expect-error Only for test
    actor.isOwner = true;
    actor.sourceDetails["data.spheres.msb.total"] = [];

    const hookSpy = vi.spyOn(Hooks, "call").mockImplementation(() => true);
    const d20RollSpy = vi.spyOn(getGame().pf1.DicePF, "d20Roll");

    await actor.spheres.rollMsb();

    expect(hookSpy).toHaveBeenCalledOnce();
    expect(hookSpy).toHaveBeenCalledWith("actorRoll", actor, "msb", null, {});
    expect(d20RollSpy).toHaveBeenCalledOnce();
    expect(d20RollSpy).toHaveBeenCalledWith({
      event: {},
      fastForward: undefined,
      parts: "",
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
    const actor = getActor();
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
