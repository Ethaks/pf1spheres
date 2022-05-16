/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type * as items from "./items";
import type * as journals from "./journals";

declare global {
  interface ImportMeta {
    env: {
      PROD: boolean;
      DEV: boolean;
    };
  }
}

export interface PackUtils {
  items: typeof items;
  journals: typeof journals;
}

/**
 * Returns a promise of either undefined (in production builds),
 * or {@link PackUtils} (in development builds).
 *
 * This somewhat clunky setup avoids requiring top-level-await, which would
 * require increasing the build target to "es2022"
 */
export let getPackUtils: () => Promise<undefined | PackUtils> = async () => undefined;

// Guard to enable tree-shaking in production
if (import.meta.env.DEV) {
  // Replace exported function to provide actual {@link PackUtils}
  getPackUtils = async () => {
    const items = await import("./items");
    const journals = await import("./journals");
    return { items, journals };
  };
}
