/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import { renderPf1sTemplate } from "./preloadTemplates";

/**
 * Hooks into the rendering of the Item sheet, adding input fields for data
 * related to the Spheres module.
 *
 * @async
 * @param  app - The sheet instance
 * @param  html - The rendered HTML element
 * @param  data - The sheet's data object
 */
export const onItemSheetRender = (
  app: ItemSheet,
  html: JQuery<HTMLElement>,
  data: ItemSheet.Data,
): void => {
  const item = app.item;

  const sphereData: PF1SItemSheetData = {
    pf1sconfig: pf1s.config,
  };

  // Handle additions to feature sheet
  if (item.type === "feat") {
    if (item.system.subType === "combatTalent") sphereData.spheres = pf1s.config.combatSpheres;
    else if (item.system.subType === "magicTalent") sphereData.spheres = pf1s.config.magicSpheres;
    else if (item.system.subType === "skillTalent") sphereData.spheres = pf1s.config.skillSpheres;

    if (sphereData.spheres != null) {
      const sphereDropdown = renderPf1sTemplate("talent-details", {
        ...data,
        ...sphereData,
      });
      html[0]
        .querySelector("[name='system.subType']")
        ?.closest(".form-group.select")
        ?.insertAdjacentHTML("afterend", sphereDropdown);
      const countExcluded = renderPf1sTemplate("talent-excluded", {
        ...data,
        ...sphereData,
      });
      html[0]
        .querySelector(".form-group.sphere-talent-type")
        ?.insertAdjacentHTML("afterend", countExcluded);
    }
  }
  // Handle additions to class sheet
  else if (item.type === "class") {
    const progressionDropdown = renderPf1sTemplate("class-progression", { ...data, ...sphereData });
    html[0]
      .querySelector(".form-group.spellcasting-type")
      ?.insertAdjacentHTML("beforebegin", progressionDropdown);
  }

  // Remove "Sphere Caster Level Capped at HD" bonus modifier choice from non-Sphere CL changes
  if ("changes" in item) {
    html.find("select.change-modifier").each((_index, element) => {
      const changeID = $(element).parents(".item .change").data("change") as string;
      const change = item.changes.get(changeID);
      if (change == null) return;

      if (!change.data.target.startsWith("spherecl")) {
        $(element).find('option[value="sphereCLCap"]').remove();
      }
    });
  }
};

interface PF1SItemSheetData {
  pf1sconfig: typeof pf1s.config;
  spheres?:
    | typeof pf1s.config.combatSpheres
    | typeof pf1s.config.magicSpheres
    | typeof pf1s.config.skillSpheres;
}
