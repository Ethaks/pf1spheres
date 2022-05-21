import type { PF1ModuleData } from "../common-data";
import { enforce, getGame, MODULE_ID } from "../util";
import * as items from "./pack-utils/items";
import * as journals from "./pack-utils/journals";
import * as devUtils from "./utils";

export interface PackUtils {
  items: typeof items;
  journals: typeof journals;
}

Hooks.on("setup", () => {
  const packUtils = { items, journals };

  const moduleData = getGame().modules.get(MODULE_ID) as PF1ModuleData;
  enforce(moduleData.api);
  moduleData.api._internal = { packUtils, devUtils };
});
