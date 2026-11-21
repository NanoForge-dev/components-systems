import type { Registry } from "@nanoforge-dev/ecs";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { hasTag } from "@nanoforge/basics-2d/tags";
import { StaticBody2D } from "@nanoforge/physics-2d/components/static-body-2d";

import { collisionsOf } from "../collisions-of";
import { DamageOnHit2D } from "../components/damage-on-hit-2d";
import { DestroyOnHit2D } from "../components/destroy-on-hit-2d";

/**
 * Removes the `DestroyOnHit2D` entities that touch a wall or a floor (`StaticBody2D`) while
 * `onStaticBodies` is on, or another entity while `by` is empty or one of its `Tag` words. Add it
 * after `applyDamage2D`, so a bullet hurts what it hits before it goes. Not on a network client:
 * there, the server removes the entities.
 *
 * @remarks
 * An entity it touched that was removed since `detectCollisions2D` has lost its `Tag`: it counts
 * as a hit only while `by` is empty, or when this entity's own `DamageOnHit2D` hurt it this frame
 * (the enemy a bullet just killed, its `target` being the same word as `by`). So an entity with a
 * `by` and no `DamageOnHit2D` ignores a target removed earlier in the frame.
 *
 * @system
 * @side shared
 */
export function destroyOnHit2D(registry: Registry) {
  const positions = registry.getComponents(Position2D);
  const statics = registry.getComponents(StaticBody2D);
  const damages = registry.getComponents(DamageOnHit2D);
  const hit = registry.getIndexedZipper([DestroyOnHit2D]).filter(({ id, DestroyOnHit2D }) => {
    const destroy = DestroyOnHit2D as DestroyOnHit2D;
    return collisionsOf(registry, registry.entityFromIndex(id)).some((other) => {
      if (positions.get(other) === undefined)
        return (
          destroy.by === "" ||
          ((damages.get(id) as DamageOnHit2D | undefined)?.touching.has(other) ?? false)
        );
      if (statics.get(other) !== undefined) return destroy.onStaticBodies;
      return destroy.by === "" || hasTag(registry, other, destroy.by);
    });
  });

  for (const { id } of hit) registry.killEntity(registry.entityFromIndex(id));
}
