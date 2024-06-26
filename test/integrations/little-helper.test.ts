/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

/**
 * @vitest-environment jsdom
 */

import { onActorBasePreparation } from "../../src/module/actor";
import { onLilHelperCheckHints } from "../../src/module/integrations/little-helper";
import { getFakeActor } from "../fakes/fake-actor";
import { FakeRoll } from "../fakes/fake-roll";

let totalCl = 0;
beforeAll(() => {
  vi.spyOn(ChatMessage, "getSpeakerActor").mockImplementation(() => {
    const actor = getFakeActor();
    onActorBasePreparation(actor);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    actor.system.spheres!.cl.total = totalCl;
    return actor;
  });
  vi.spyOn(RollPF, "safeRoll").mockImplementation(
    () => new FakeRoll({ total: 1 }) as unknown as Roll,
  );
});

class Tag {
  check: number;
  success: boolean;
  failure: boolean;
  possible: boolean;
  content;
  hint: string | null;
  constructor(
    label: string,
    {
      hint = null,
      check = 0,
      success = false,
      possible = false,
      failure = false,
    }: Omit<Partial<Tag>, "content"> = {},
  ) {
    this.check = check;
    this.content = label;
    this.hint = hint;
    this.success = success;
    this.possible = possible;
    this.failure = failure;
  }
}

describe("LittleHelperIntegration#onLilHelperCheckHints", () => {
  let tags: Tag[] = [];
  beforeEach(() => {
    tags = [];
  });

  test("should create a tag for Concentration checks", () => {
    onLilHelperCheckHints(tags, {
      subject: { pf1spheres: "concentration" },
      // @ts-expect-error Provide only data necessary for function
      cm: { data: { speaker: undefined } },
      result: 16,
      cls: Tag,
    });
    expect(tags).toHaveLength(4);
  });

  test("should create success tags when check > maxCl", () => {
    totalCl = 5;
    onLilHelperCheckHints(tags, {
      subject: { pf1spheres: "concentration" },
      // @ts-expect-error Provide only data necessary for function
      cm: { data: { speaker: undefined } },
      result: 15 + totalCl + 1,
      cls: Tag,
    });
    expect(tags).toHaveLength(4);
    const [defenseTag, , , entangleTag] = tags;
    expect(defenseTag.possible).toBeTruthy();
    expect(defenseTag.success).toBeTruthy();
    expect(defenseTag.failure).toBeFalsy();

    expect(entangleTag.possible).toBeTruthy();
    expect(entangleTag.success).toBeTruthy();
    expect(entangleTag.failure).toBeFalsy();
  });

  test("should create correct tags when maxCl > check > 15", () => {
    totalCl = 5;
    onLilHelperCheckHints(tags, {
      subject: { pf1spheres: "concentration" },
      // @ts-expect-error Provide only data necessary for function
      cm: { data: { speaker: undefined } },
      result: 17,
      cls: Tag,
    });
    expect(tags).toHaveLength(4);
    const [defenseTag, , , entangleTag] = tags;
    // Result > 15 -> possible
    expect(defenseTag.possible).toBeTruthy();
    // 15 < Result < 15 + 5[CL] -> No guaranteed success
    expect(defenseTag.success).toBeFalsy();
    // Result > 15 -> no guaranteed failure
    expect(defenseTag.failure).toBeFalsy();

    // Result > 15 -> possible
    expect(entangleTag.possible).toBeTruthy();
    // Result >= 15 + (floor(CL / 2))[Max spell level -> CL] -> success guaranteed
    expect(entangleTag.success).toBeTruthy();
    // Result > 14 -> no guaranteed failure
    expect(entangleTag.failure).toBeFalsy();
  });

  test("should create correct tags when ½maxCl > check > 15", () => {
    totalCl = 5;
    onLilHelperCheckHints(tags, {
      subject: { pf1spheres: "concentration" },
      // @ts-expect-error Provide only data necessary for function
      cm: { data: { speaker: undefined } },
      result: 16,
      cls: Tag,
    });
    expect(tags).toHaveLength(4);
    const [defenseTag, , , entangleTag] = tags;
    // Result > 15 -> possible
    expect(defenseTag.possible).toBeTruthy();
    // 15 < Result < 15 + 5[CL] -> No guaranteed success
    expect(defenseTag.success).toBeFalsy();
    // Result > 15 -> no guaranteed failure
    expect(defenseTag.failure).toBeFalsy();

    // Result > 15 -> possible
    expect(entangleTag.possible).toBeTruthy();
    // Result < 15 + (floor(CL / 2))[Max spell level -> CL] -> no guaranteed success
    expect(entangleTag.success).toBeFalsy();
    // Result > 14 -> no guaranteed failure
    expect(entangleTag.failure).toBeFalsy();
  });

  test("should create a failure tag when check <= 15", () => {
    totalCl = 0;
    onLilHelperCheckHints(tags, {
      subject: { pf1spheres: "concentration" },
      // @ts-expect-error Provide only data necessary for function
      cm: { data: { speaker: undefined } },
      result: 14,
      cls: Tag,
    });
    expect(tags).toHaveLength(4);
    const [defenseTag, , , entangleTag] = tags;
    expect(defenseTag.possible).toBeFalsy();
    expect(defenseTag.success).toBeFalsy();
    expect(defenseTag.failure).toBeTruthy();

    expect(entangleTag.possible).toBeFalsy();
    expect(entangleTag.success).toBeFalsy();
    expect(entangleTag.failure).toBeTruthy();
  });
});
