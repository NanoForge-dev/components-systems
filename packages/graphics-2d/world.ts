import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import "@nanoforge-dev/graphics-2d";

import { Hud2D } from "./components/hud-2d";

/** A point, in pixels. */
export interface Point {
  x: number;
  y: number;
}

/**
 * Where a point of the screen, in game coordinates (as the mouse gives it), is in the world: a
 * `Camera2D` moves and zooms the world's layer. Without `ctx.graphics` (an app without
 * `Graphics2DLibrary`, such as a 3D client), the point is returned as it is.
 */
export const toWorld = (ctx: Context, point: Point): Point => {
  const layer = ctx.graphics?.baseLayer;
  if (!layer) return point;
  return {
    x: (point.x - layer.x()) / layer.scaleX(),
    y: (point.y - layer.y()) / layer.scaleY(),
  };
};

/**
 * Where a point of the screen is for the entity of id `id`: in the world, or on the screen for a
 * `Hud2D` entity, which the camera doesn't move.
 */
export const pointFor = (registry: Registry, ctx: Context, id: number, point: Point): Point =>
  registry.getEntityComponent(registry.entityFromIndex(id), Hud2D) ? point : toWorld(ctx, point);
