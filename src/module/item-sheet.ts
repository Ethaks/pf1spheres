import { PF1S } from "./config";
import { PF1ItemData } from "./item-data";

export const onItemSheetRender = async (
  app: BaseEntitySheet,
  html: JQuery<HTMLElement>,
  data: BaseEntitySheet.Data
): Promise<void> => {
  // Handle stuff
  const item = app.object as Item;
  const itemData = item.data as PF1ItemData;

  const sphereData: PF1SItemSheetData = {
    pf1sconfig: PF1S,
  };

  // Only handle classes and talents
  if (!["class", "feat"].includes(item.data.type)) return;

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
};

interface PF1SItemSheetData {
  pf1sconfig: typeof PF1S;
  spheres?: typeof PF1S.combatSpheres | typeof PF1S.magicSpheres;
}
