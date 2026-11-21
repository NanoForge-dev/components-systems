import type { Entity, Registry } from "@nanoforge-dev/ecs";
import { touching } from "@nanoforge/physics-2d/collisions";

import { Owner } from "./components/owner";

/**
 * Ids of the entities touching `entity` this frame, by its hitboxes, without its `Owner`'s entity,
 * the entities it owns (a shooter's bullets) and the entities with the same owner (a bullet's
 * sibling bullets).
 *
 * @remarks
 * An entity removed since `detectCollisions2D` (killed by an earlier system this frame) is still
 * listed, and `registry.entityFromIndex` throws for it: read its components by id,
 * `registry.getComponents(Health).get(id)`, which gives `undefined`.
 */
export const collisionsOf = (registry: Registry, entity: Entity): number[] => {
  const self = entity.getId();
  const owner = (registry.getEntityComponent(entity, Owner) as Owner | undefined)?.entity ?? -1;
  const owners = registry.getComponents(Owner);
  return touching(registry, entity).filter((id) => {
    const of = (owners.get(id) as Owner | undefined)?.entity;
    return id !== owner && of !== self && (owner < 0 || of !== owner);
  });
};
