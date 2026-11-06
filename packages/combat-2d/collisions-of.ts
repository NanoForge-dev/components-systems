import type { Entity, Registry } from "@nanoforge-dev/ecs";
import { HitboxCircle2D } from "@nanoforge/physics-2d/components/hitbox-circle-2d";
import { HitboxRect2D } from "@nanoforge/physics-2d/components/hitbox-rect-2d";

import { Owner } from "./components/owner";

/** Ids of the entities touching `entity` this frame, by its hitboxes, its owner left out. */
export const collisionsOf = (registry: Registry, entity: Entity): number[] => {
  const owner: Owner | undefined = registry.getEntityComponent(entity, Owner);
  const rect: HitboxRect2D | undefined = registry.getEntityComponent(entity, HitboxRect2D);
  const circle: HitboxCircle2D | undefined = registry.getEntityComponent(entity, HitboxCircle2D);
  const ids = [...(rect?.collisions ?? []), ...(circle?.collisions ?? [])];
  return ids.filter((id) => id !== owner?.entity);
};
