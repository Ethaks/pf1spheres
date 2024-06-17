/*
 * SPDX-FileCopyrightText: 2024 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import { getAllSpheres } from "./item-util";
import { LocalizationKey, MODULE_ID } from "./util";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export declare class CompendiumBrowser {
  static filterClasses: (typeof BaseFilter)[];
}

export declare class BaseFilter {
  static label: LocalizationKey;
  static type: string;
  static indexField: string;

  choices: Collection<FilterChoice>;
  prepareChoices(): void;
}

export declare interface FilterChoice {
  label: string;
  key: string;
  active?: boolean;
}

export declare class CheckboxFilter extends BaseFilter {
  static getChoicesFromConfig(
    configObject: Record<string, string> | Record<string, Record<string, string>>,
  ): Collection<FilterChoice>;
}

/**
 * Adds a filter to the Feat Browser to filter by sphere.
 */
export const registerSphereFilter = () => {
  const FeatBrowser = pf1.applications.compendiumBrowser.FeatBrowser;
  FeatBrowser.filterClasses.push(SphereFilter);
};

/**
 * A filter for the Feat Browser that filters by sphere.
 */
export class SphereFilter extends pf1.applications.compendiumBrowser.filters.CheckboxFilter {
  static label: LocalizationKey = "PF1SPHERES.SpherePlural";
  static type = "feat";
  static indexField = `flags.${MODULE_ID}.sphere`;

  override prepareChoices() {
    const spheres = getAllSpheres();
    return (this.choices = (this.constructor as typeof CheckboxFilter).getChoicesFromConfig(
      spheres,
    ));
  }
}
