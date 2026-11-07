import type { Registry } from "@nanoforge-dev/ecs";

import { collisionsOf } from "../collisions-of";
import { DamageDealer } from "../components/damage-dealer";
import { Health } from "../components/health";

/**
 * Removes the `damage` of each `DamageDealer` from the `Health` of the entities it starts
 * touching, and kills the entities whose health reaches 0. Add it after `detectCollisions2D`.
 *
 * @system
 * @side shared
 */
export function applyDamage2D(registry: Registry) {
  const dead = new Set<number>();

  registry.getIndexedZipper([DamageDealer]).forEach(({ id, DamageDealer: dealer }) => {
    const touching = new Set(collisionsOf(registry, registry.entityFromIndex(id)));
    for (const other of touching) {
      if ((dealer as DamageDealer).touching.has(other)) continue;
      const health: Health | undefined = registry.getEntityComponent(
        registry.entityFromIndex(other),
        Health,
      );
      if (!health) continue;
      health.current = Math.max(0, health.current - (dealer as DamageDealer).damage);
      if (health.current === 0) dead.add(other);
    }
    (dealer as DamageDealer).touching = touching;
  });

  for (const id of dead) registry.killEntity(registry.entityFromIndex(id));
}
