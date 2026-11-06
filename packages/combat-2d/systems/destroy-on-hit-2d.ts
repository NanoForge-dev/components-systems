import type { Registry } from "@nanoforge-dev/ecs";
import { StaticBody2D } from "@nanoforge/physics-2d/components/static-body-2d";

import { collisionsOf } from "../collisions-of";
import { DestroyOnHit2D } from "../components/destroy-on-hit-2d";

/**
 * Kills the `DestroyOnHit2D` entities that touch another entity. Add it after `applyDamage2D`,
 * so a bullet hurts what it hits before it disappears.
 *
 * @system
 * @side shared
 */
export function destroyOnHit2D(registry: Registry) {
  const hit = registry
    .getIndexedZipper([DestroyOnHit2D])
    .filter(({ id, DestroyOnHit2D }) =>
      collisionsOf(registry, registry.entityFromIndex(id)).some(
        (other) =>
          (DestroyOnHit2D as DestroyOnHit2D).onStaticBodies ||
          !registry.getEntityComponent(registry.entityFromIndex(other), StaticBody2D),
      ),
    );

  for (const { id } of hit) registry.killEntity(registry.entityFromIndex(id));
}
