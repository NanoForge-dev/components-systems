import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import { hasTag } from "@nanoforge/basics-2d/tags";

import { collisionsOf } from "../collisions-of";
import { DamageOnHit2D } from "../components/damage-on-hit-2d";
import { Health } from "../components/health";

/**
 * Removes the `damage` of each `DamageOnHit2D` from the `Health` of the entities tagged `target`
 * that it touches: when they start touching, then `hitRate` times a second. Health stays between 0
 * and `max`, and an entity whose health reaches 0 is removed, unless its `removeAtZero` is off.
 * Add it after `detectCollisions2D`. Not on a network client: there, the server hurts.
 *
 * @system
 * @side shared
 */
export function applyDamage2D(registry: Registry, ctx: Context) {
  const seconds = ctx.app.delta / 1000;
  const healths = registry.getComponents(Health);
  const dead = new Set<number>();

  registry.getIndexedZipper([DamageOnHit2D]).forEach(({ id, DamageOnHit2D }) => {
    const dealer = DamageOnHit2D as DamageOnHit2D;
    const touching = new Map<number, number>();
    for (const other of new Set(collisionsOf(registry, registry.entityFromIndex(id)))) {
      // By id first: an entity removed earlier this frame (a collected coin) has no Health.
      const health = healths.get(other) as Health | undefined;
      if (!health) continue;
      if (dealer.target !== "" && !hasTag(registry, other, dealer.target)) continue;
      const wait = dealer.touching.get(other);
      if (wait === undefined || (dealer.hitRate > 0 && wait - seconds <= 0)) {
        health.current = Math.min(health.max, Math.max(0, health.current - dealer.damage));
        if (health.current === 0 && health.removeAtZero) dead.add(other);
        touching.set(other, dealer.hitRate > 0 ? 1 / dealer.hitRate : Infinity);
      } else touching.set(other, wait - seconds);
    }
    dealer.touching = touching;
  });

  for (const id of dead) registry.killEntity(registry.entityFromIndex(id));
}
