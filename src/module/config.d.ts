/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

/**
 * Runtime config object for the PF1 Spheres module
 */
export declare const PF1S: {
  /**
   * The different rates at which a class advances caster or practicioner levels.
   */
  progression: {
    low: string;
    med: string;
    high: string;
  };
  /**
   * Formulae for {@link progression}
   */
  progressionFormulae: {
    low: number;
    med: number;
    high: number;
  };
};
