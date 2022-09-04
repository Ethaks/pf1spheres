// SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
//
// SPDX-License-Identifier: EUPL-1.2

import type { Ability, ActorDataPath, ActorPF } from "./actor-data";
import type { TotalModData } from "./common-data";
import type { MagicSphere, SourceEntry } from "./item-data";

import { isMagicSphere } from "./item-util";
import { enforce, localize } from "./util";
import { PF1S } from "./config";

/**
 * Returns a function that adds a SourceEntry to a given actor's sourceInfo
 *
 * @param actor - The actor to whose sourceInfo data is added
 * @param modifierType - Whether the source info is positive or negative
 */
const pushSourceInfo = (actor: ActorPF, modifierType: "positive" | "negative") => {
  const getSourceInfo = pf1.documents.actor.changes.getSourceInfo;
  /**
   * Adds a SourceEntry to this actor's sourceInfo. If the key ends in ".base",
   * a similar SourceEntry will also be pushed to the key's ".total".
   *
   * @param key - The data path for which the SourceEntry to be added applies
   * @param value - The SourceEntry to be added
   */
  return (key: ActorDataPath, value: SourceEntry): void => {
    const baseSource = key.endsWith(".base");
    getSourceInfo(actor.sourceInfo, key)[modifierType].push(value);
    if (baseSource)
      getSourceInfo(actor.sourceInfo, key.replace(".base", ".total") as ActorDataPath)[
        modifierType
      ].push(value);
  };
};

/**
 * Returns a function that looks up a given actor's ability modifiers
 *
 * @param actor - The actor whose ability modifiers should be returned
 */
const getActorAbility =
  (actor: ActorPF) =>
  /**
   * Returns an actor's ability modifier for a specific ability, or 0 if no modifier can be found
   *
   * @param ability - The ability whose modifier is to be returned
   * @returns The ability modifier
   */
  (ability: Ability | "" | undefined) =>
    ability !== undefined && ability !== "" ? actor.system.abilities[ability]?.mod : 0 ?? 0;

/**
 * Returns a collection of helper functions working with an actor
 *
 * @param actor - The actor to be used by the helper functions
 */
export const getActorHelpers = (actor: ActorPF) => {
  return {
    pushPSourceInfo: pushSourceInfo(actor, "positive"),
    pushNSourceInfo: pushSourceInfo(actor, "negative"),
    getAbilityMod: getActorAbility(actor),
  };
};

/** Returns a function that returns relevant highest magic CL data for a specific actor */
export const getHighestCl =
  (actor: ActorPF) =>
  /**
   * Returns an object containing this actor's highest magic CL, whether it's the total level or in
   * a specific sphere, and a possible lable should the CL be displayed. */
  (): { sphere: MagicSphere | "total"; label: string; cl: number } => {
    const clData = actor.system.spheres?.cl;
    enforce(clData, `Could not determine highest CL for ${actor.name}: No CL data found!`);
    const highest: [MagicSphere | "total", number] = Object.entries(clData)
      .filter((entry): entry is [MagicSphere, TotalModData<number>] => isMagicSphere(entry[0]))
      .map(([sphere, data]): [MagicSphere, number] => [sphere, data.total])
      .reduce(
        (acc: [MagicSphere | "total", number], [sphere, cl]) => (cl > acc[1] ? [sphere, cl] : acc),
        ["total", clData.total]
      );
    return {
      sphere: highest[0],
      label: highest[0] === "total" ? localize("CasterLevel") : PF1S.magicSpheres[highest[0]],
      cl: highest[1],
    };
  };
