/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { SafePropPath, StripPrefix } from "./ts-util";
import { nonNullable } from "./ts-util";
import type langEn from "../../public/lang/en.json";

/** Type of the English localisation file */
type LangEn = typeof langEn;

/** The module's name/id */
export const MODULE_ID = "pf1spheres" as const;

/**
 * Prefixes a localisation key for this module is allowed to start with,
 * causing it to not be prefixed with `PF1SPHERES`.
 */
const allowedPrefixes = [
  "ACTOR",
  "ITEM",
  "PF1",
  MODULE_ID.toUpperCase() as Uppercase<typeof MODULE_ID>,
] as const;

export type LocalizationKey =
  | StripPrefix<"PF1SPHERES", SafePropPath<LangEn>>
  | SafePropPath<LangEn>
  | `${Exclude<(typeof allowedPrefixes)[number], Uppercase<typeof MODULE_ID>>}.${string}`;

/**
 * Returns a localised string from a localisation key.
 * If the key does not start with "ACTOR", "ITEM", or "PF1", a prefix of
 * "PF1SPHERES" will be used for the key.
 *
 * @param key - The localisation key
 * @param data - Data used for variables in the localisation string
 * @param debug - Whether console warnings should be printed when a localisation key is not found
 *  TODO: Replace with logger
 * @returns The localised string
 */
export const localize = (
  key: LocalizationKey,
  data?: Record<string, unknown>,
  debug = false,
): string => {
  const startsWithPrefix = allowedPrefixes.some((prefix) => key.startsWith(prefix));
  const result = startsWithPrefix
    ? getGame().i18n.format(key, data)
    : getGame().i18n.format(`PF1SPHERES.${key}`, data);

  if (debug && startsWithPrefix && allowedPrefixes.some((prefix) => result.startsWith(prefix)))
    console.warn(`No translation string found for ${key}`);

  return result;
};

/**
 * Returns the game global after checking that it is actually initialised
 */
export const getGame = (): Game => {
  if (!(game instanceof Game)) throw new Error("Game not initialised");
  return game;
};

/**
 * Tests if the given `value` is truthy.
 *
 * If it is not truthy, an {@link Error} is thrown, which depends on the given `message` parameter:
 * - If `message` is a string`, it is used to construct a new {@link Error} which then is thrown.
 * - If `message` is an instance of {@link Error}, it is thrown.
 * - If `message` is `undefined`, an {@link Error} with a default message is thrown.
 */
export function enforce(value: unknown, message?: string | Error): asserts value {
  if (!value) {
    if (!message) {
      message =
        "There was an unexpected error in the Spheres for Pathfinder 1e module. For more details, please take a look at the console (F12).";
    }
    throw message instanceof Error ? message : new Error(message);
  }
}

/** Creates an HTMLElement for a {@link Roll}, adding some data */
export function enrichRoll(roll: Roll, formula: string, label: string | number) {
  return createNode("a", {
    attributes: {
      class: "inline-roll inline-result",
      "data-roll": escape(JSON.stringify(roll)), // Ignore deprecation, Foundry uses this
      title: formula,
    },
    html: `<i class="fas fa-dice-d20"></i> ${label}`,
  });
}

interface CreateNodeOptions {
  /** Attributes set for the HTMLElement via {@link HTMLElement.setAttribute} */
  attributes?: Record<string, string>;
  /**
   * A string of HTML directly set as the element's {@link HTMLElement.innerHTML}
   * before possible children are added
   */
  html?: string;
  /* Additional children */
  children?: string | HTMLElement | (string | HTMLElement)[];
  baseNode?: HTMLElement | undefined;
}

/**
 * Creates an HTMLElement for a given `tag` and optionally sets attributes, innerHTML, children.
 *
 * @param tag - A valid HTML tag name, like "a" or "span"
 * @param options - Additional options affecting the element's contents
 * @returns The created HTML element
 */
export function createNode(tag: string, options: CreateNodeOptions = {}) {
  const element = document.createElement(tag);
  if (options.attributes !== undefined)
    for (const a in options.attributes) element.setAttribute(a, options.attributes[a]);
  if (options.html !== undefined) element.innerHTML = options.html;
  const children = Array.isArray(options.children) ? options.children : [options.children];
  children.filter(nonNullable).forEach((child) => {
    element.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  });

  if (options.baseNode !== undefined) {
    options.baseNode.appendChild(element);
  }
  return element;
}
