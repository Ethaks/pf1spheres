/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import pc from "picocolors";
import type { Logger } from "vite";
import type { Formatter } from "picocolors/types";

/**
 * A utility class wrapping a {@link import("vite").Logger} instance to provide uniform log formatting
 */
export class ViteLoggerPFS {
  /** Common prefix for all log messages */
  static prefixBase = pc.bold("[PF1S]");

  /**
   * The logger used by this instance to log messages
   */
  logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Returns the current time in the localised format
   */
  static getTime(): string {
    return `${pc.dim(new Date().toLocaleTimeString())}`;
  }

  /**
   * Returns the common prefix for all log messages, optionally colored to signal the severity
   *
   * @param color - The color to use for the prefix
   * @returns {string} The full, formatted prefix
   */
  static prefix(color: Formatter = pc.blue) {
    return `${pc.dim(this.getTime())} ${color(this.prefixBase)}`;
  }

  /**
   * Logs an info message to a {@link Logger}
   *
   * @param message - message to be logged
   */
  info(message: string) {
    this.logger.info(`${(this.constructor as typeof ViteLoggerPFS).prefix()} ${message}`);
  }

  /**
   * Logs a warning message to a {@link Logger}
   *
   * @param message - message to be logged
   */
  warn(message: string) {
    this.logger.warn(`${(this.constructor as typeof ViteLoggerPFS).prefix(pc.yellow)} ${message}`);
  }

  /**
   * Logs an error message to a {@link Logger}
   *
   * @param message - message to be logged
   */
  error(message: string) {
    this.logger.error(`${(this.constructor as typeof ViteLoggerPFS).prefix(pc.red)} ${message}`);
  }
}
