import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import "@nanoforge-dev/scene";
import { DrawableText2D } from "@nanoforge/graphics-2d/components/drawable-text-2d";

import { SceneVarText2D } from "../components/scene-var-text-2d";

/**
 * Writes the var of every `SceneVarText2D` in its entity's `DrawableText2D`, through its
 * template. Add it once everything moved, after the systems that change vars and before `draw2D`.
 *
 * @remarks
 * The app needs a `SceneLibrary`.
 *
 * @system
 * @side client
 */
export const showSceneVars2D = (registry: Registry, ctx: Context) => {
  registry
    .getZipper([SceneVarText2D, DrawableText2D])
    .forEach(({ SceneVarText2D, DrawableText2D }) => {
      const { variable, template } = SceneVarText2D as SceneVarText2D;
      const value = ctx.scenes.vars.get(variable);
      DrawableText2D.text = template.replace("{}", value === undefined ? "-" : String(value));
    });
};
