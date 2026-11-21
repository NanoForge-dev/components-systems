import type { Registry } from "@nanoforge-dev/ecs";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { taggedIds } from "@nanoforge/basics-2d/tags";

import { centerOf, nearest } from "../collisions";
import { ChaseNearest2D } from "../components/chase-nearest-2d";
import { RigidBody2D } from "../components/rigid-body-2d";
import { WalkAndJump2D } from "../components/walk-and-jump-2d";
import { walkedAxes } from "../walking";

/**
 * Walks each `ChaseNearest2D` entity toward the nearest entity tagged with its `target` within its
 * `range`: sets its `WalkAndJump2D`'s `moveX`/`moveY` to that direction on the axes the walker walks,
 * or to 0 when none is in range. Add it before `walkAndJump2D`.
 *
 * @remarks
 * Under gravity, or with `axes` set to one axis, it heads for the target's side at full speed, so a
 * platformer enemy doesn't slow down when the player jumps. Distances are between hitbox middles
 * (`centerOf`). Tagged entities without a `Position2D`, such as models, are never chased.
 *
 * @system
 * @side shared
 */
export const chaseNearest2D = (registry: Registry) => {
  // The centers of the entities with each word, measured once per frame for every chaser.
  const centers = new Map<string, { id: number; x: number; y: number }[]>();
  const candidatesOf = (word: string) => {
    let found = centers.get(word);
    if (!found) {
      found = taggedIds(registry, word).flatMap((id) => {
        const entity = registry.entityFromIndex(id);
        const position: Position2D | undefined = registry.getEntityComponent(entity, Position2D);
        return position ? [{ id, ...centerOf(registry, entity, position) }] : [];
      });
      centers.set(word, found);
    }
    return found;
  };

  registry
    .getIndexedZipper([ChaseNearest2D, WalkAndJump2D, Position2D])
    .forEach(({ id, ChaseNearest2D, WalkAndJump2D, Position2D }) => {
      const chase = ChaseNearest2D as ChaseNearest2D;
      const walker = WalkAndJump2D as WalkAndJump2D;
      const entity = registry.entityFromIndex(id);
      const from = centerOf(registry, entity, Position2D as Position2D);
      const others = candidatesOf(chase.target).filter((candidate) => candidate.id !== id);
      const target = nearest(from, others, chase.range);
      // Only on the axes it walks, so the other axis doesn't eat into its speed.
      const axes = walkedAxes(walker, registry.getEntityComponent(entity, RigidBody2D));
      const dx = target && axes.x ? target.x - from.x : 0;
      const dy = target && axes.y ? target.y - from.y : 0;
      const length = Math.hypot(dx, dy);
      walker.moveX = length > 0 ? dx / length : 0;
      walker.moveY = length > 0 ? dy / length : 0;
    });
};
