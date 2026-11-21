import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";

import { Lifetime } from "../components/lifetime";
import { Model } from "../components/model";

/**
 * Counts down every `Lifetime`, and removes the entities whose time is up. Add it last. Not on a
 * network client: there, the server removes the entities.
 *
 * @remarks
 * A `Model`'s lifetime doesn't count down, so its copies start with all of theirs.
 *
 * @system
 * @side shared
 */
export const expireLifetimes = (registry: Registry, ctx: Context) => {
  const seconds = ctx.app.delta / 1000;
  const expired: number[] = [];

  registry.getIndexedZipper([Lifetime]).forEach(({ id, Lifetime }) => {
    if (registry.getEntityComponent(registry.entityFromIndex(id), Model)) return;
    const lifetime = Lifetime as Lifetime;
    lifetime.left -= seconds;
    if (lifetime.left <= 0) expired.push(id as number);
  });

  for (const id of expired) registry.killEntity(registry.entityFromIndex(id));
};
