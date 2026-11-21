import type { Entity, Registry } from "@nanoforge-dev/ecs";

import { DrawableCircle2D } from "./components/drawable-circle-2d";
import { DrawableRect2D } from "./components/drawable-rect-2d";
import { DrawableText2D } from "./components/drawable-text-2d";
import { Hud2D } from "./components/hud-2d";

/** A shape `draw2D` draws. */
export type Drawable2D = DrawableRect2D | DrawableCircle2D | DrawableText2D;

/** The entity's `DrawableRect2D`, `DrawableCircle2D` or `DrawableText2D`, in that order. */
export const drawableOf = (registry: Registry, entity: Entity): Drawable2D | undefined =>
  (registry.getEntityComponent(entity, DrawableRect2D) as DrawableRect2D | undefined) ??
  (registry.getEntityComponent(entity, DrawableCircle2D) as DrawableCircle2D | undefined) ??
  (registry.getEntityComponent(entity, DrawableText2D) as DrawableText2D | undefined);

/** The middle of an entity at `position`: a rectangle's position is its top-left corner. */
export const middleOf = (
  registry: Registry,
  entity: Entity,
  position: { x: number; y: number },
) => {
  const rect: DrawableRect2D | undefined = registry.getEntityComponent(entity, DrawableRect2D);
  return { x: position.x + (rect?.width ?? 0) / 2, y: position.y + (rect?.height ?? 0) / 2 };
};

/**
 * Whether the drawable of `entity` at `position` covers `point` (both in the same pixels: see
 * `pointFor`). A visible `DrawableRect2D` covers from its top-left corner to its width and height,
 * its rotation ignored; a visible `DrawableCircle2D` covers its radius around its center, edge
 * included. A text, or no drawable, covers nothing.
 */
export const containsPoint = (
  registry: Registry,
  entity: Entity,
  position: { x: number; y: number },
  point: { x: number; y: number },
): boolean => {
  const drawable = drawableOf(registry, entity);
  if (!drawable?.visible) return false;
  if (drawable instanceof DrawableRect2D)
    return (
      point.x >= position.x &&
      point.x < position.x + drawable.width &&
      point.y >= position.y &&
      point.y < position.y + drawable.height
    );
  if (drawable instanceof DrawableCircle2D)
    return Math.hypot(point.x - position.x, point.y - position.y) <= drawable.radius;
  return false;
};

/**
 * Of the entities of ids `ids`, the one drawn on top: `Hud2D` entities first, then the highest
 * `zIndex()` of its drawable's shape (-1 before its first draw), then the highest id; `undefined`
 * for no ids.
 */
export const topmost = (registry: Registry, ids: number[]): number | undefined => {
  const ranked = ids.map((id) => {
    const entity = registry.entityFromIndex(id);
    const hud = registry.getEntityComponent(entity, Hud2D) ? 1 : 0;
    return { id, hud, z: drawableOf(registry, entity)?.shape?.zIndex() ?? -1 };
  });
  ranked.sort((a, b) => b.hud - a.hud || b.z - a.z || b.id - a.id);
  return ranked[0]?.id;
};
