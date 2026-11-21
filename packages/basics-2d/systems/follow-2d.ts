import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";

import { Follow2D } from "../components/follow-2d";
import { Position2D } from "../components/position-2d";
import { taggedIds } from "../tags";

/**
 * Moves each `Follow2D` entity to the entity tagged with its `target`, plus its offset. Add it
 * after the systems that move the target (`move2D`, `blockOnStaticBodies2D`).
 *
 * @remarks
 * It follows the first other entity with that tag and a `Position2D`, so a model or a camera
 * sharing the word doesn't stop it. While there is none, it stays where it is.
 *
 * @system
 * @side shared
 */
export const follow2D = (registry: Registry, ctx: Context) => {
  const seconds = ctx.app.delta / 1000;

  registry.getIndexedZipper([Follow2D, Position2D]).forEach(({ id, Follow2D, Position2D }) => {
    const follow = Follow2D as Follow2D;
    const position = Position2D as Position2D;
    const target = taggedIds(registry, follow.target)
      .filter((other) => other !== id)
      .map((other): Position2D | undefined =>
        registry.getEntityComponent(registry.entityFromIndex(other), Position2D),
      )
      .find((found) => found !== undefined);
    if (!target) return;

    // The share of the way covered this frame, the same whatever the frame rate.
    const share = follow.lag > 0 ? 1 - Math.exp(-seconds / follow.lag) : 1;
    position.x += (target.x + follow.offsetX - position.x) * share;
    position.y += (target.y + follow.offsetY - position.y) * share;
  });
};
