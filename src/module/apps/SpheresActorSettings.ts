// SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
//
// SPDX-License-Identifier: EUPL-1.2

import type { ActorDataSource } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";
import type { SpheresActorFlags } from "../actor-data";
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

  /** @inheritdoc */
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

    return { pf1sFlags, PF1CONFIG: CONFIG.PF1, PF1S: pf1s.config };
  }

  override _updateObject(_event: Event, formData: DeepPartial<ActorDataSource>) {
    return this.object.update(formData);
  }

  /** @inheritdoc */
  override activateListeners(html: JQuery<HTMLElement>) {
    if (!this.isEditable) return;
    html.on("change", "input,select,textarea", this._onChangeInput.bind(this));
  }
}

interface SettingsRenderData {
  pf1sFlags: SpheresActorFlags;
  PF1CONFIG: typeof CONFIG.PF1;
  PF1S: typeof pf1s.config;
}
