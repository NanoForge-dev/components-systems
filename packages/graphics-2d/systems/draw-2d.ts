import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import "@nanoforge-dev/graphics-2d";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";

import { DrawableCircle2D } from "../components/drawable-circle-2d";
import { DrawableRect2D } from "../components/drawable-rect-2d";
import { DrawableText2D } from "../components/drawable-text-2d";
import { Hud2D } from "../components/hud-2d";
import type { Drawable2D } from "../drawable-of";
import { hudLayer } from "../hud-layer";

/** The drawables shown by the last frame. */
let shown = new Set<Drawable2D>();

/**
 * Draws every entity that has a `Position2D` and a `DrawableRect2D`, `DrawableCircle2D` or
 * `DrawableText2D`, where it is. Add it after the systems that move entities, before
 * `drawHealthBars2D` and `expireLifetimes`.
 *
 * @remarks
 * The shape of a killed entity, or of a removed drawable, is removed from the screen. `Hud2D`
 * entities are drawn on a layer over the world, which a `Camera2D` doesn't move.
 *
 * @system
 * @side client
 */
export function draw2D(registry: Registry, ctx: Context) {
  const hud = new Set(registry.getIndexedZipper([Hud2D]).map(({ id }) => id as number));
  const layerOf = (id: number) => (hud.has(id) ? hudLayer(ctx) : ctx.graphics.baseLayer);
  const drawn = new Set<Drawable2D>();

  registry
    .getIndexedZipper([DrawableRect2D, Position2D])
    .forEach(({ id, DrawableRect2D, Position2D }) => {
      DrawableRect2D.draw(layerOf(id), Position2D, ctx.assets);
      drawn.add(DrawableRect2D);
    });
  registry
    .getIndexedZipper([DrawableCircle2D, Position2D])
    .forEach(({ id, DrawableCircle2D, Position2D }) => {
      DrawableCircle2D.draw(layerOf(id), Position2D, ctx.assets);
      drawn.add(DrawableCircle2D);
    });
  registry
    .getIndexedZipper([DrawableText2D, Position2D])
    .forEach(({ id, DrawableText2D, Position2D }) => {
      DrawableText2D.draw(layerOf(id), Position2D);
      drawn.add(DrawableText2D);
    });

  // `killEntity` doesn't call `destroy()`: a drawable no longer in the world loses its shape here.
  for (const drawable of shown) if (!drawn.has(drawable)) drawable.destroy();
  shown = drawn;
}
