import { PF1S } from "./config";
import { ItemType, PF1ItemData } from "./item-data";

/**
 * Hooks into the rendering of the Item sheet, adding input fields for data
 * related to the Spheres module.
 *
 * @async
 * @param  app - The sheet instance
 * @param  html - The rendered HTML element
 * @param  data - The sheet's data object
 */
export const onItemSheetRender = async (
  app: BaseEntitySheet,
  html: JQuery<HTMLElement>,
  data: BaseEntitySheet.Data
): Promise<void> => {
  const item = app.object as PFItem;
  const itemData = item.data as PF1ItemData;

  const sphereData: PF1SItemSheetData = {
    pf1sconfig: PF1S,
  };

  // Only handle classes and talents
  if (!["class", "feat"].includes(item.data.type as ItemType)) return;

  // Handle additions to feature sheet
  if (itemData.type === "feat") {
    if (itemData.data.featType === "combatTalent") sphereData.spheres = PF1S.combatSpheres;
    else if (itemData.data.featType === "magicTalent") sphereData.spheres = PF1S.magicSpheres;
    else return;

    const sphereDropdown = await renderTemplate("modules/pf1spheres/templates/talent-details.hbs", {
      ...data,
      ...sphereData,
    });
    html.find("div.tab.details > div:nth-child(2)").after(sphereDropdown);
  }
  // Handle additions to class sheet
  else if (itemData.type === "class") {
    const progressionDropdown = await renderTemplate(
      "modules/pf1spheres/templates/class-progression.hbs",
      { ...data, ...sphereData }
    );
    html.find("div.tab.details > div:nth-child(5)").after(progressionDropdown);
  }

  // Remove "Sphere Caster Level Capped at HD" bonus modifier choice from non-Sphere CL changes
  if ("changes" in item) {
    html.find("select.change-modifier").each((_index, element) => {
      const changeID = $(element).parents(".item .change").data("change") as string;
      const change = item.changes.get(changeID);
      if (change == null) return;

      if (!change.data.subTarget.startsWith("spherecl")) {
        $(element).find('option[value="sphereCLCap"]').remove();
      }
    });
  }
};

interface PF1SItemSheetData {
  pf1sconfig: typeof PF1S;
  spheres?: typeof PF1S.combatSpheres | typeof PF1S.magicSpheres;
}
