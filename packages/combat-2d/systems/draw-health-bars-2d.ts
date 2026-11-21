import type { Context } from "@nanoforge-dev/common";
import type { Entity, Registry } from "@nanoforge-dev/ecs";
import "@nanoforge-dev/graphics-2d";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { taggedIds } from "@nanoforge/basics-2d/tags";
import { DrawableCircle2D } from "@nanoforge/graphics-2d/components/drawable-circle-2d";
import { DrawableRect2D } from "@nanoforge/graphics-2d/components/drawable-rect-2d";
import { layerFor } from "@nanoforge/graphics-2d/hud-layer";
import { boxOf } from "@nanoforge/physics-2d/collisions";

import { Health } from "../components/health";
import { HealthBar2D } from "../components/health-bar-2d";

/** The bars shown by the last frame. */
let shown = new Set<HealthBar2D>();

/** The left edge, top and width of the drawable of `entity` at `position`, for one without a hitbox. */
const drawableBox = (registry: Registry, entity: Entity, position: Position2D) => {
  const rect: DrawableRect2D | undefined = registry.getEntityComponent(entity, DrawableRect2D);
  if (rect) return { x: position.x, y: position.y, width: rect.width };
  const circle: DrawableCircle2D | undefined = registry.getEntityComponent(
    entity,
    DrawableCircle2D,
  );
  const radius = circle?.radius ?? 0;
  return { x: position.x - radius, y: position.y - radius, width: radius * 2 };
};

/**
 * Draws each `HealthBar2D` with the `Health` it shows: over its entity, or at its `Position2D`
 * with a `target`, on the screen for a `Hud2D` entity. Add it after `draw2D`, so the bars are drawn
 * over the shapes.
 *
 * @remarks
 * A bar whose `Health` is gone, with its entity or its target's, is removed from the screen.
 *
 * @system
 * @side client
 */
export const drawHealthBars2D = (registry: Registry, ctx: Context) => {
  const drawn = new Set<HealthBar2D>();
  const healthOf = (id: number): Health | undefined =>
    registry.getEntityComponent(registry.entityFromIndex(id), Health);

  registry
    .getIndexedZipper([HealthBar2D, Position2D])
    .forEach(({ id, HealthBar2D, Position2D }) => {
      const bar = HealthBar2D as HealthBar2D;
      const position = Position2D as Position2D;
      const health =
        bar.target === ""
          ? healthOf(id)
          : taggedIds(registry, bar.target)
              .map(healthOf)
              .find((found) => found !== undefined);
      if (!health) return;

      const left = health.max > 0 ? Math.max(0, Math.min(1, health.current / health.max)) : 0;
      const layer = layerFor(registry, ctx, id);
      if (bar.target !== "") bar.draw(layer, position.x, position.y, left);
      else {
        const entity = registry.entityFromIndex(id);
        const box = boxOf(registry, entity, position) ?? drawableBox(registry, entity, position);
        bar.draw(
          layer,
          box.x + (box.width - bar.barWidth) / 2,
          box.y - bar.gap - bar.barHeight,
          left,
        );
      }
      drawn.add(bar);
    });

  for (const bar of shown) if (!drawn.has(bar)) bar.destroy();
  shown = drawn;
};
