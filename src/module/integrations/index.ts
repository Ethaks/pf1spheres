/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import { getGame } from "../util";
import { registerLilHelperHooks } from "./little-helper";

/**
 * A function that activates all module integrations, either directly
 * using their APIs, registering event hooks, or registering hooks waiting
 * for modules to signal they're ready to be accessed.
 */
export const initializeModuleIntegrations = () => {
  if (getGame().modules.get("koboldworks-pf1-little-helper")?.active) {
    registerLilHelperHooks();
  }
};
