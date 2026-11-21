import type { Registry } from "@nanoforge-dev/ecs";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { Velocity2D } from "@nanoforge/basics-2d/components/velocity-2d";

import { boxOf } from "../collisions";
import { Bounds2D } from "../components/bounds-2d";

/**
 * Where a box spanning `start` to `start + size` on one axis goes, in an area from `min` and
 * `length` long: `undefined` once out for good.
 */
const keep = (
  start: number,
  size: number,
  min: number,
  length: number,
  mode: Bounds2D["mode"],
): number | undefined => {
  const max = min + length;
  if (mode === "clamp") return Math.max(min, Math.min(start, max - size));
  if (start >= max) return mode === "wrap" ? min - size : undefined;
  if (start + size <= min) return mode === "wrap" ? max : undefined;
  return start;
};

/**
 * Keeps each `Bounds2D` entity inside its area: stopped at the edge, brought back on the other
 * side, or removed, by its `mode`. Add it after `move2D`; in `destroy` mode, not on a network
 * client.
 *
 * @remarks
 * The entity's size is its hitbox with its offset (`boxOf`), a circle's bounding square; without
 * one, only its position counts.
 *
 * @system
 * @side shared
 */
export const keepInBounds2D = (registry: Registry) => {
  const out: number[] = [];

  registry.getIndexedZipper([Bounds2D, Position2D]).forEach(({ id, Bounds2D, Position2D }) => {
    const bounds = Bounds2D as Bounds2D;
    const position = Position2D as Position2D;
    const entity = registry.entityFromIndex(id);
    const box = boxOf(registry, entity, position) ?? {
      x: position.x,
      y: position.y,
      width: 0,
      height: 0,
    };

    const x = keep(box.x, box.width, bounds.left, bounds.areaWidth, bounds.mode);
    const y = keep(box.y, box.height, bounds.top, bounds.areaHeight, bounds.mode);
    if (x === undefined || y === undefined) {
      out.push(id as number);
      return;
    }

    const velocity: Velocity2D | undefined = registry.getEntityComponent(entity, Velocity2D);
    if (bounds.mode === "clamp" && velocity) {
      if (x !== box.x) velocity.x = 0;
      if (y !== box.y) velocity.y = 0;
    }
    // Moved by as much as its box, which can sit off its position.
    if (x !== box.x) position.x = x - (box.x - position.x);
    if (y !== box.y) position.y = y - (box.y - position.y);
  });

  for (const id of out) registry.killEntity(registry.entityFromIndex(id));
};
