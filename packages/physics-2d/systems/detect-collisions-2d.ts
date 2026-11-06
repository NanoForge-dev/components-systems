import type { Registry } from "@nanoforge-dev/ecs";
import { Position2D } from "@nanoforge/basics/components/position-2d";

import { boxRoundOverlap, boxesOverlap, roundsOverlap } from "../collisions";
import { HitboxCircle2D } from "../components/hitbox-circle-2d";
import { HitboxRect2D } from "../components/hitbox-rect-2d";

/**
 * Finds which entities touch each other, by their `HitboxRect2D` or `HitboxCircle2D`, and lists
 * them in each hitbox's `collisions`. Add it after the systems that move entities.
 *
 * @system
 * @side shared
 */
export function detectCollisions2D(registry: Registry) {
  const boxes = registry
    .getIndexedZipper([Position2D, HitboxRect2D])
    .map(({ id, Position2D, HitboxRect2D }) => ({
      id: id as number,
      hitbox: HitboxRect2D as HitboxRect2D,
      shape: {
        x: Position2D.x,
        y: Position2D.y,
        width: HitboxRect2D.width,
        height: HitboxRect2D.height,
      },
    }));
  const rounds = registry
    .getIndexedZipper([Position2D, HitboxCircle2D])
    .map(({ id, Position2D, HitboxCircle2D }) => ({
      id: id as number,
      hitbox: HitboxCircle2D as HitboxCircle2D,
      shape: { x: Position2D.x, y: Position2D.y, radius: HitboxCircle2D.radius },
    }));

  for (const { hitbox } of [...boxes, ...rounds]) hitbox.collisions.length = 0;

  const touch = (a: { id: number; hitbox: { collisions: number[] } }, b: typeof a) => {
    a.hitbox.collisions.push(b.id);
    b.hitbox.collisions.push(a.id);
  };
  boxes.forEach((a, i) => {
    for (const b of boxes.slice(i + 1)) if (boxesOverlap(a.shape, b.shape)) touch(a, b);
    for (const b of rounds) if (a.id !== b.id && boxRoundOverlap(a.shape, b.shape)) touch(a, b);
  });
  rounds.forEach((a, i) => {
    for (const b of rounds.slice(i + 1)) if (roundsOverlap(a.shape, b.shape)) touch(a, b);
  });
}
