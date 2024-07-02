// SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
//
// SPDX-License-Identifier: EUPL-1.2

import type { ActorDataSource } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";
import type { Ability, SpheresActorFlags } from "../actor-data";
import { getGame, localize } from "../util";

/**
 * A FormApplication belonging to one actor, allowing configuration of Spheres settings
 * regardless of whether the default sheet or an alternative one is used.
 */
export class SpheresActorSettings extends FormApplication<
  FormApplicationOptions,
  SettingsRenderData,
  Actor
> {
  /** @inheritdoc */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "spheres-settings-editor",
      classes: ["pf1spheres"],
      title: localize("Settings.Title"),
      template: "modules/pf1spheres/templates/apps/actor-settings.hbs",
      width: 600,
      height: 600,
      closeOnSubmit: false,
      submitOnClose: false,
      submitOnChange: true,
    });
  }

  override get id() {
    return `${this.constructor.name}-${this.object.uuid.replace(/\./g, "-")}`;
  }

  override get isEditable() {
    let editable = this.options["editable"] && this.object.isOwner;
    if (this.object.pack) {
      const pack = getGame().packs.get(this.object.pack);
      if (pack && pack.locked) editable = false;
    }
    return editable;
  }

  /** @inheritdoc */
  override getData() {
    const pf1sFlags = this.object.toObject().flags.pf1spheres ?? {};

    const abilitySettings: AbilityFlagRenderData[] = [
      {
        name: "flags.pf1spheres.castingAbility",
        label: "PF1SPHERES.CastingAbility",
        options: pf1.config.abilities,
        value: pf1sFlags.castingAbility ?? "",
        rollPath: `@spheres.cam`,
      },
      {
        name: "flags.pf1spheres.practitionerAbility",
        label: "PF1SPHERES.PractitionerAbility",
        options: pf1.config.abilities,
        value: pf1sFlags.practitionerAbility ?? "",
        rollPath: `@spheres.pam`,
      },
      {
        name: "flags.pf1spheres.operativeAbility",
        label: "PF1SPHERES.OperativeAbility",
        options: pf1.config.abilities,
        value: pf1sFlags.operativeAbility ?? "",
        rollPath: `@spheres.oam`,
      },
    ];

    return { appId: this.id, abilitySettings, pf1sFlags, PF1CONFIG: CONFIG.PF1, PF1S: pf1s.config };
  }

  override _updateObject(_event: Event, formData: DeepPartial<ActorDataSource>) {
    return this.object.update(formData);
  }
}

interface SettingsRenderData {
  appId: string;
  abilitySettings: AbilityFlagRenderData[];
  pf1sFlags: SpheresActorFlags;
  PF1CONFIG: typeof CONFIG.PF1;
  PF1S: typeof pf1s.config;
}

interface AbilityFlagRenderData {
  label: string;
  name: `flags.pf1spheres.${keyof SpheresActorFlags}`;
  value: Ability | "";
  rollPath: string;
  options: Record<Ability, string>;
}
