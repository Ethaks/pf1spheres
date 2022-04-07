/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { ActorPF } from "./actor-data";
import { getActorMethods } from "./actor-methods";
import { PF1S } from "./config";
import type { CombatSphere, ItemPF, MagicSphere, SourceEntry, Sphere } from "./item-data";
import { getGame, localize } from "./util";

export const onActorSheetRender: (
  app: ActorSheetPF,
  html: JQuery,
  options: ActorSheetPFData
) => Promise<boolean> = async (app, html, _options) => {
  if (app.spheresTab == null) {
    app.spheresTab = { activateTab: false, expandedSpheres: {} };
  }
  addTab(app, html);
  const body = html.find("section.primary-body").first();

  const actor = app.actor as ActorPF;

  const renderData = getSpheresData(app, actor);
  const renderedTemplate = await getRenderedSpheresTab(renderData);
  const spheresBody = body.append($(renderedTemplate));
  activateListeners(app, spheresBody, actor);

  // Re-focus spheres tab TODO: Can be expanded for multiple tabs
  if (app.spheresTab.activateTab === "spheres") {
    // @ts-expect-error Accessing tabs is necessary
    app._tabs[0].activate("spheres");
    app.setPosition();
  }

  return true;
};

const addTab = (app: ActorSheetPF, html: JQuery<HTMLElement>) => {
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
  if (!actor.data.data.spheres) throw new Error("Spheres data missing!");
  const attributeGrid = (["cl", "msb", "msd"] as const).map(
    (attribute): AttributeData => ({
      attribute,
      total: actor.data.data.spheres?.[attribute].total ?? 0,
      label: localize(attribute.toLocaleUpperCase()),
      path: `@spheres.${attribute}.total`,
      sources: actor.sourceDetails[`data.spheres.${attribute}.total` as const],
      cappedSources: actor.sourceDetails[`data.spheres.${attribute}.modCap` as const] ?? [],
      rollable: ["msb"].includes(attribute) ? "rollable" : "",
    })
  );
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
    total: actor.data.data.attributes.bab.total,
    label: localize("PF1.BABAbbr"),
    path: `@attributes.bab.total`,
    sources: actor.sourceDetails["data.attributes.bab.total"],
    cappedSources: [],
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
    magic: localize("CLAbbr"),
    combat: localize("PF1.BABAbbr"),
  };

  // TODO: Remove if no longer needed
  //const isMagicSphere = (sphere: Sphere): sphere is MagicSphere => sphere in PF1S.magicSpheres;

  // Get owned talents and collect info for every sphere regardless of talents
  const ownedTalents = actor.items.reduce((talents: TalentMap, item) => {
    const sphere = item.data.flags.pf1spheres?.sphere;
    if (
      item.data.type === "feat" &&
      ["combatTalent", "magicTalent"].includes(item.data.data.featType) &&
      sphere
    ) {
      talents[sphere] ??= [];
      talents[sphere]?.push(getTalentTemplateData(item));
    }
    return talents;
  }, {});
  const sphereCLs = Object.keys(PF1S.magicSpheres).map(
    (sphere): SphereData => ({
      sphere,
      label: PF1S.magicSpheres[sphere],
      levelLabel: levelLabels.magic,
      total: actor.data.data.spheres?.cl[sphere].total ?? 0,
      path: `@spheres.cl.${sphere}.total`,
      icon: PF1S.sphereIcons[sphere],
      talents: ownedTalents[sphere] ?? [],
      hasTalents: Boolean(ownedTalents[sphere]?.length),
      expandTalents: Boolean(app.spheresTab.expandedSpheres[sphere] ?? false),
      ...getSphereClSources(actor)(sphere),
    })
  );
  const sphereBabs = Object.keys(PF1S.combatSpheres).map(
    (sphere): SphereData => ({
      sphere,
      label: PF1S.combatSpheres[sphere],
      levelLabel: levelLabels.combat,
      total: actor.data.data.spheres?.bab[sphere].total ?? 0,
      path: `@spheres.bab.${sphere}.total`,
      icon: PF1S.sphereIcons[sphere],
      talents: ownedTalents[sphere] ?? [],
      hasTalents: Boolean(ownedTalents[sphere]?.length),
      expandTalents: Boolean(app.spheresTab.expandedSpheres[sphere] ?? false),
      ...getSphereBabSources(actor)(sphere),
    })
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
  renderTemplate("/modules/pf1spheres/templates/actor-spheres-tab.hbs", data);

const activateListeners = (app: ActorSheetPF, html: JQuery<HTMLElement>, actor: ActorPF) => {
  html.find(".msb>.attribute-name.rollable").on("click", _onMsbRoll(actor));

  // html.find(".attribute-grid>.cl, .attribute-grid>.bab").on("click", _toggleSphereLevelDisplay);

  html.find(".expand-sphere").on("click", _toggleSphereTalentsDisplay(app));

  html
    .find(".talent-name")
    // @ts-expect-error Weird contextmenu types?
    .on("contextmenu", getGame().pf1.applications.ActorSheetPF.prototype._onItemEdit.bind(app));
};

const getTalentTemplateData = (item: ItemPF): TalentTemplateData => ({
  id: item.id ?? "",
  img: item.img ?? foundry.data.ItemData.DEFAULT_ICON,
  name: item.name ?? "",
  tags: item.data.data.tags.flat(),
  hasAction: item.hasAction,
  activationType: item.labels.activation,
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
  const options = {
    event: ev,
    label: localize("Checks.MSB"),
  };
  return getActorMethods(actor).rollSpheresAttribute("msb", options);
};

// TODO: Remove if no longer needed
// const _toggleSphereLevelDisplay = (ev: JQuery.ClickEvent<HTMLElement>) => {
//   ev.preventDefault();
//   const targetLevels = ev.currentTarget.classList?.contains("cl") ? "sop" : "som";
//   const sphereList = $(ev.currentTarget)
//     .parents(".spheres")
//     .find(`.${targetLevels}-levels`)
//     .first();
//   sphereList.slideToggle({
//     duration: "fast",
//     complete: function () {
//       if ($(this).is(":visible")) $(this).css("display", "grid");
//     },
//     start: function () {
//       $(this).css("display", "grid");
//     },
//   });
// };

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

const getSphereClSources =
  (actor: ActorPF) =>
  (sphere: MagicSphere): { sources: SourceEntry[]; cappedSources: SourceEntry[] } => {
    const baseSources = actor.sourceDetails["data.spheres.cl.base"] ?? [];
    const cappedBaseSources = actor.sourceDetails["data.spheres.cl.modCap"] ?? [];
    const sphereSources = actor.sourceDetails[`data.spheres.cl.${sphere}.total` as const] ?? [];
    const cappedSources = actor.sourceDetails[`data.spheres.cl.${sphere}.modCap` as const] ?? [];
    return {
      sources: [...baseSources, ...sphereSources],
      cappedSources: [...cappedBaseSources, ...cappedSources],
    };
  };

const getSphereBabSources = (actor: ActorPF) => (sphere: CombatSphere) => {
  const baseSources = actor.sourceDetails["data.attributes.bab.total"] ?? [];
  const sphereSources = actor.sourceDetails[`data.spheres.bab.${sphere}.total` as const] ?? [];
  const cappedSources = actor.sourceDetails[`data.spheres.bab.${sphere}.modCap` as const] ?? [];
  return {
    sources: [...baseSources, ...sphereSources],
    cappedSources,
  };
};

interface ActorSheetPFData {
  actor: ActorPF;
}

export declare class ActorSheetPF extends ActorSheet {
  _onItemEdit: (ev: JQuery.ClickEvent<HTMLElement>) => void;
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
  label: string;
  levelLabel: string;
  total: number;
  path: string;
  icon: string;
  talents: TalentTemplateData[];
  hasTalents: boolean;
  sources: SourceEntry[];
  expandTalents: boolean;
}

type TalentMap = {
  [Key in Sphere]?: TalentTemplateData[];
};

//type ItemProperties = ToObjectFalseType<ItemPF["data"]>;

interface AttributeData {
  attribute?: "cl" | "msb" | "msd" | "bab" | "martialFocus" | "spellPool";
  sphere?: Sphere;
  total: number;
  label: string;
  path: string;
  sources: SourceEntry[];
  cappedSources: SourceEntry[];
  rollable: "rollable" | "";
}
