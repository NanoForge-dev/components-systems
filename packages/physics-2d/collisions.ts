import type { Entity, Registry } from "@nanoforge-dev/ecs";

import { HitboxCircle2D } from "./components/hitbox-circle-2d";
import { HitboxRect2D } from "./components/hitbox-rect-2d";

/** A rectangle by its top-left corner and size, in pixels. */
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A circle by its center and radius, in pixels. */
export interface Round {
  x: number;
  y: number;
  radius: number;
}

/** Whether two rectangles overlap (touching edges don't). */
export const boxesOverlap = (a: Box, b: Box): boolean =>
  a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

/** Whether two circles overlap (touching edges don't). */
export const roundsOverlap = (a: Round, b: Round): boolean =>
  Math.hypot(a.x - b.x, a.y - b.y) < a.radius + b.radius;

/** Whether a rectangle and a circle overlap (touching edges don't). */
export const boxRoundOverlap = (box: Box, round: Round): boolean => {
  const nearestX = Math.min(Math.max(round.x, box.x), box.x + box.width);
  const nearestY = Math.min(Math.max(round.y, box.y), box.y + box.height);
  return Math.hypot(round.x - nearestX, round.y - nearestY) < round.radius;
};

/** Ids of the entities touching `entity` this frame, by its hitboxes (see `detectCollisions2D`). */
export const touching = (registry: Registry, entity: Entity): number[] => {
  const rect: HitboxRect2D | undefined = registry.getEntityComponent(entity, HitboxRect2D);
  const circle: HitboxCircle2D | undefined = registry.getEntityComponent(entity, HitboxCircle2D);
  return [...(rect?.collisions ?? []), ...(circle?.collisions ?? [])];
};

/**
 * The hitbox of `entity` at `position` (its `Position2D`), as a rectangle: its `HitboxRect2D` at
 * the position plus its offset, else the square around its `HitboxCircle2D` centered on the
 * position plus its offset; `undefined` without a hitbox. Blocking, bounds, paddles, shooting,
 * aiming, chasing and health bars read hitboxes through it.
 */
export const boxOf = (
  registry: Registry,
  entity: Entity,
  position: { x: number; y: number },
): Box | undefined => {
  const rect: HitboxRect2D | undefined = registry.getEntityComponent(entity, HitboxRect2D);
  if (rect) {
    const { offsetX, offsetY, width, height } = rect;
    return { x: position.x + offsetX, y: position.y + offsetY, width, height };
  }
  const circle: HitboxCircle2D | undefined = registry.getEntityComponent(entity, HitboxCircle2D);
  if (!circle) return undefined;
  const { offsetX, offsetY, radius } = circle;
  return {
    x: position.x + offsetX - radius,
    y: position.y + offsetY - radius,
    width: radius * 2,
    height: radius * 2,
  };
};

/** The middle of the hitbox of `entity` at `position` (see `boxOf`), else the position itself. */
export const centerOf = (
  registry: Registry,
  entity: Entity,
  position: { x: number; y: number },
): { x: number; y: number } => {
  const box = boxOf(registry, entity, position);
  return box
    ? { x: box.x + box.width / 2, y: box.y + box.height / 2 }
    : { x: position.x, y: position.y };
};

/**
 * The candidate closest to `from` within `range` pixels, edge included (0 or less: any distance),
 * or `undefined`; the first one wins a tie. Leave out what can't be chosen (the seeker itself)
 * before.
 */
export const nearest = <T extends { x: number; y: number }>(
  from: { x: number; y: number },
  candidates: T[],
  range: number,
): T | undefined => {
  let best: T | undefined;
  let bestDistance = Infinity;
  for (const candidate of candidates) {
    const distance = Math.hypot(candidate.x - from.x, candidate.y - from.y);
    if (distance < bestDistance && (range <= 0 || distance <= range)) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best;
};
