/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { ActorPF, PF1ActorSpheresData, SpheresTalentsRecord } from "./actor-data";
import { SpheresActorSettings } from "./apps/SpheresActorSettings";
import type { CombatSphere, ItemPF, MagicSphere, Sphere } from "./item-data";
import { enforce, getGame, localize } from "./util";
import { renderPf1sTemplate } from "./preloadTemplates";
import { activateSphereTooltip } from "./sphere-tooltip";

export const onActorSheetHeaderButtons = (
  sheet: ActorSheetPF,
  buttons: Application.HeaderButton[],
) => {
  if (sheet.isEditable) {
    const actor = sheet.actor;
    buttons.unshift({
      class: "pf1spheres-actor-settings",
      icon: "fas fa-spinner",
      label: localize("SpherePlural"),
      onclick: (_) => new SpheresActorSettings(actor).render(true),
    });
  }
};

export const onActorSheetRender: (
  app: ActorSheetPF,
  html: JQuery,
  options: ActorSheetPFData,
) => boolean = (app, html, _options) => {
  if (app.spheresTab == null) {
    app.spheresTab = { activateTab: false, expandedSpheres: {} };
  }
  addNavTab(app, html);

  const body = html.find("section.primary-body").first();

  const actor = app.actor as ActorPF;

  const renderData = getSpheresData(app, actor);
  const renderedTemplate = getRenderedSpheresTab(renderData);
  const spheresBody = body.append($(renderedTemplate));
  activateListeners(app, spheresBody, actor);

  // Re-focus spheres tab
  // NOTE: Can be expanded for multiple tabs
  if (app.spheresTab.activateTab === "spheres") {
    // @ts-expect-error Accessing tabs is necessary
    app._tabs[0].activate("spheres");
    app.setPosition();
  }

  return true;
};

const addNavTab = (app: ActorSheetPF, html: JQuery<HTMLElement>) => {
  // Handle tab in navigation TODO: Pure JS?
  const tabSelector = html.find("nav.sheet-navigation.tabs").first();
  const spheresTabTitle = `<a class="item" data-tab="spheres">${localize("SpherePlural")}</a>`;
  const newTab = tabSelector.append($(spheresTabTitle));
  newTab.on("click", (ev: JQuery.ClickEvent<HTMLElement>) => {
    const isSpheresTab = ev.target.dataset?.tab === "spheres";
    app.spheresTab.activateTab = isSpheresTab ? "spheres" : false;
  });
};

const getSpheresData = (app: ActorSheetPF, actor: ActorPF): SpheresTemplateData => {
  if (!actor.system.spheres) throw new Error("Spheres data missing!");
  const spheres = actor.system.spheres as PF1ActorSpheresData;

  const attributeGrid = (["cl", "msb", "msd"] as const).map(
    (attribute): AttributeData => ({
      attribute,
      total: spheres[attribute].total ?? 0,
      label: localize(attribute.toLocaleUpperCase() as Uppercase<typeof attribute>),
      rollable: ["msb"].includes(attribute) ? "rollable" : "",
    }),
  );
  // Insert Concentration element between MSB and MSD
  attributeGrid.splice(2, 0, {
    attribute: "concentration",
    total: actor.system.spheres.concentration.total ?? 0,
    label: localize("PF1.Concentration"),
    rollable: "rollable",
  });

  // const spellPool = actor.items.getName("Spell Pool");
  // attributeGrid.push({
  //   attribute: "spellPool",
  //   total: spellPool && "uses" in spellPool.data.data ? spellPool?.data.data.uses?.value ?? 0 : 0,
  //   label: "Spell Pool", // TODO: localise, or use item tag?
  //   path: spellPool
  //     ? spellPool.data.data.useCustomTag
  //       ? `@resources.${spellPool.data.data.tag}`
  //       : "@resources.spellPool.value"
  //     : "",
  //   sources: [],
  //   cappedSources: [],
  //   rollable: "",
  // });

  attributeGrid.push({
    attribute: "bab",
    total: actor.system.attributes.bab.total,
    label: localize("PF1.BABAbbr"),
    rollable: "",
  });
  // const martialFocus = actor.items.getName("Martial Focus");
  // attributeGrid.push({
  //   attribute: "martialFocus",
  //   total:
  //     martialFocus && "uses" in martialFocus.data.data
  //       ? martialFocus?.data.data.uses?.value ?? 0
  //       : 0,
  //   label: "Martial Focus", // TODO: localise, or use item tag?
  //   path: martialFocus
  //     ? martialFocus?.data.data.useCustomTag
  //       ? `@resources.${martialFocus?.data.data.tag}.value`
  //       : "@resources.martialFocus.value"
  //     : "",
  //   sources: [],
  //   cappedSources: [],
  //   rollable: "",
  // });

  const levelLabels = {
    magic: localize("CL"),
    combat: localize("PF1.BABAbbr"),
  };

  // Get owned talents and collect info for every sphere regardless of talents
  const ownedTalents = actor.items.reduce((talents: TalentMap, item) => {
    const sphere = item.flags.pf1spheres?.sphere;
    if (
      item.type === "feat" &&
      ["combatTalent", "magicTalent"].includes(item.system.subType) &&
      sphere
    ) {
      talents[sphere] ??= [];
      talents[sphere]?.push(getTalentTemplateData(item));
    }
    return talents;
  }, {});
  const sphereCLs = Object.keys(pf1s.config.magicSpheres).map(
    (sphere): SphereData => ({
      sphere,
      tooltipId: `cl:${sphere}`,
      label: pf1s.config.magicSpheres[sphere].label,
      levelLabel: levelLabels.magic,
      total: spheres.cl[sphere].total ?? 0,
      icon: pf1s.config.magicSpheres[sphere].icon || CONFIG.Item.documentClass.DEFAULT_ICON,
      talents: ownedTalents[sphere] ?? [],
      talentCounts: spheres.talents[sphere],
      hasTalents: Boolean(ownedTalents[sphere]?.length),
      expandTalents: Boolean(app.spheresTab.expandedSpheres[sphere] ?? false),
    }),
  );
  const sphereBabs = Object.keys(pf1s.config.combatSpheres).map(
    (sphere): SphereData => ({
      sphere,
      tooltipId: `bab:${sphere}`,
      label: pf1s.config.combatSpheres[sphere].label,
      levelLabel: levelLabels.combat,
      total: actor.system.spheres?.bab[sphere].total ?? 0,
      icon: pf1s.config.combatSpheres[sphere].icon || CONFIG.Item.documentClass.DEFAULT_ICON,
      talents: ownedTalents[sphere] ?? [],
      talentCounts: spheres.talents[sphere],
      hasTalents: Boolean(ownedTalents[sphere]?.length),
      expandTalents: Boolean(app.spheresTab.expandedSpheres[sphere] ?? false),
    }),
  );

  return {
    dataGroup: "primary",
    attributeGrid,
    sphereCLs,
    sphereBabs,
    allSpheres: [...sphereCLs, ...sphereBabs].sort((a, b) => a.sphere.localeCompare(b.sphere)),
  };
};

const getRenderedSpheresTab = (data: SpheresTemplateData) =>
  renderPf1sTemplate("actor-spheres-tab", data);

const activateListeners = (app: ActorSheetPF, html: JQuery<HTMLElement>, actor: ActorPF) => {
  html.find(".msb>.attribute-name.rollable").on("click", _onMsbRoll(actor));
  html.find(".concentration>.attribute-name.rollable").on("click", _onConcentrationRoll(actor));

  html.find(".expand-sphere").on("click", _toggleSphereTalentsDisplay(app));

  html
    .find(".talent-name")
    // @ts-expect-error Weird contextmenu types?
    .on("contextmenu", pf1.applications.actor.ActorSheetPF.prototype._onItemEdit.bind(app));

  // TODO: Decide upon own solution for rolling – depends on how talents should be activated
  html
    .find(".talent-use>a")
    .on("click", pf1.applications.actor.ActorSheetPF.prototype._itemActivationControl.bind(app));
  html.find(".talent .talent-icon").on("click", (event) => app._onItemRoll(event));

  html.find(".sphere-label").on("click", _openSphereJournal);

  html
    // @ts-expect-error Incorrect types
    .on("pointerover", "[data-tooltip-sphere]", activateSphereTooltip(app))
    // @ts-expect-error Missing tooltip types
    .on("pointerleave", "[data-tooltip-sphere]", () => getGame().tooltip.deactivate());
};

const getTalentTemplateData = (item: ItemPF): TalentTemplateData => ({
  id: item.id ?? "",
  img: item.img ?? pf1.config.defaultIcons.items.feat,
  name: item.name ?? "",
  tags: item.system.tags,
  hasAction: item.hasAction,
  activationType: item.getLabels().activation,
});

interface TalentTemplateData {
  id: string;
  img: string;
  name: string;
  tags: string[];
  hasAction: boolean;
  activationType: string;
}

const _onMsbRoll = (actor: ActorPF) => (ev: JQuery.ClickEvent<HTMLElement>) => {
  ev.preventDefault();
  return actor.spheres.rollMsb({ skipDialog: pf1.documents.settings.getSkipActionPrompt() });
};

const _onConcentrationRoll = (actor: ActorPF) => (ev: JQuery.ClickEvent<HTMLElement>) => {
  ev.preventDefault();
  return actor.spheres.rollConcentration({
    skipDialog: pf1.documents.settings.getSkipActionPrompt(),
  });
};

/**
 * Opens a journal entry sheet for the clicked on sphere
 *
 * @param event - The click event for a sphere label
 */
const _openSphereJournal = async (event: JQuery.ClickEvent<HTMLElement>) => {
  event.preventDefault();

  const sphere = event.currentTarget.closest(".sphere")?.dataset.sphere as Sphere | undefined;
  enforce(sphere);
  const sphereConfigs = {
    ...pf1s.config.magicSpheres,
    ...pf1s.config.combatSpheres,
    ...pf1s.config.skillSpheres,
  };
  const sphereConfig = sphereConfigs[sphere];
  if (!("reference" in sphereConfig)) throw new Error(`Sphere ${sphere} has no reference`);
  return openJournal(sphereConfig.reference, { width: 700, height: 800 });
};

/**
 * Opens journal or journal page.
 *
 * Pages are opened in collapsed state.
 *
 * @param uuid - UUID to journal or journal page
 * @param [options={}] - Additional rendering options
 */
export async function openJournal(uuid: string, options = {}) {
  const journal = await fromUuid(uuid);
  enforce(journal);

  // @ts-expect-error Missing types
  if (journal instanceof JournalEntryPage) {
    journal.parent.sheet.render(true, {
      pageId: journal.id,
      editable: false,
      collapsed: true,
      width: 600,
      height: 700,
      ...options,
    });
  } else {
    // @ts-expect-error Missing types
    journal.sheet.render(true, { editable: false, ...options });
  }

  return journal;
}

const _toggleSphereTalentsDisplay = (app: ActorSheetPF) => (ev: JQuery.ClickEvent<HTMLElement>) => {
  ev.preventDefault();

  // TODO: Look for pure JS alternative?
  const sphere = $(ev.currentTarget).parents(".sphere").data("sphere") as Sphere;
  const talents = $(ev.currentTarget).parents(".sphere").find(".sphere-talents");
  talents.slideToggle({
    duration: "fast",
    complete: function () {
      if ($(this).is(":visible")) {
        $(this).css("display", "grid");
        app.spheresTab.expandedSpheres[sphere] = true;
      } else {
        app.spheresTab.expandedSpheres[sphere] = false;
      }
    },
    start: function () {
      $(this).css("display", "grid");
    },
  });

  ev.currentTarget.querySelector("i").classList.toggle("rotate-arrow");
};

interface ActorSheetPFData {
  actor: ActorPF;
}

export declare class ActorSheetPF extends ActorSheet {
  _onItemEdit: (ev: JQuery.ClickEvent<HTMLElement>) => void;
  _itemActivationControl: (ev: JQuery.ClickEvent<HTMLElement>) => void;
  _onItemRoll: (ev: JQuery.ClickEvent<HTMLElement>) => void;
  spheresTab: {
    activateTab: string | false;
    expandedSpheres: Partial<Record<Sphere, boolean>>;
  };
}

interface SpheresTemplateData {
  dataGroup: string;
  attributeGrid: AttributeData[];
  sphereCLs: SphereData[];
  sphereBabs: SphereData[];
  allSpheres: SphereData[];
}

interface SphereData {
  sphere: MagicSphere | CombatSphere;
  tooltipId: string;
  label: string;
  levelLabel: string;
  total: number;
  icon: string;
  talents: TalentTemplateData[];
  hasTalents: boolean;
  expandTalents: boolean;
  talentCounts: SpheresTalentsRecord[Sphere];
}

type TalentMap = {
  [Key in Sphere]?: TalentTemplateData[];
};

interface AttributeData {
  attribute?: "cl" | "msb" | "concentration" | "msd" | "bab" | "martialFocus" | "spellPool";
  sphere?: Sphere;
  total: number;
  label: string;
  rollable: "rollable" | "";
}
