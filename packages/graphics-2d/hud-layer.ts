import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import { Layer, type Stage } from "@nanoforge-dev/graphics-2d";

import { Hud2D } from "./components/hud-2d";

const layers = new WeakMap<Stage, Layer>();

/** The layer of the `Hud2D` entities, over the world's: made the first time it is needed. */
export const hudLayer = (ctx: Context): Layer => {
  const { stage } = ctx.graphics;
  let layer = layers.get(stage);
  if (!layer) {
    layer = new Layer();
    stage.add(layer);
    layers.set(stage, layer);
  }
  return layer;
};

/** The layer the entity of id `id` is drawn on: the HUD's for a `Hud2D` entity, else the world's. */
export const layerFor = (registry: Registry, ctx: Context, id: number): Layer =>
  registry.getEntityComponent(registry.entityFromIndex(id), Hud2D)
    ? hudLayer(ctx)
    : ctx.graphics.baseLayer;
