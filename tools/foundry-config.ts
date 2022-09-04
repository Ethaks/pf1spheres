/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import path from "node:path";
import fs from "fs-extra";

interface FoundryConfig {
  /** The path to the user data directory. */
  dataPath: string | null;
  /** The path to Foundry's app directory. */
  appPath: string | null;
  /** The prefix to use for all routes. */
  routePrefix: string | null;
  /** Whether to open the browser when starting the development server. */
  openBrowser: boolean;
}

const rawFoundryConfig: Partial<FoundryConfig> = await fs
  .readJson(path.resolve(__dirname, "..", "foundryconfig.json"))
  .catch(() => ({}));

/**
 * An object containing various configuration values related to Foundry VTT and the system's build process.
 * */
export const FOUNDRY_CONFIG: FoundryConfig = Object.freeze({
  dataPath: null,
  appPath: null,
  routePrefix: null,
  openBrowser: false,
  ...rawFoundryConfig,
});

/**
 * Returns a URL including the configured route prefix from {@link FOUNDRY_CONFIG}.
 *
 * @param relativePath - A URL
 * @param absolute - Whether the URL should start with a `/`
 * @returns A URL including the configured route prefix
 */
export function resolveUrl(relativePath: string, absolute = true): string {
  const routeStart = absolute ? "/" : "";
  const routePrefix = FOUNDRY_CONFIG.routePrefix ? `${FOUNDRY_CONFIG.routePrefix}/` : "";
  return `${routeStart}${routePrefix}${relativePath}`;
}

/**
 * Removes the configured route prefix from a URL.
 *
 * @param prefixedUrl - A URL possibly containing the configured route prefix
 * @returns A URL without the configured route prefix
 */
export function removePrefix(prefixedUrl: string): string {
  const routePrefix = FOUNDRY_CONFIG.routePrefix ? `${FOUNDRY_CONFIG.routePrefix}/` : "";
  return prefixedUrl.replace(routePrefix, "");
}
