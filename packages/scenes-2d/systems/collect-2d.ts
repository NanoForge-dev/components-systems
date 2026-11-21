import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import "@nanoforge-dev/scene";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { hasTag } from "@nanoforge/basics-2d/tags";
import { touching } from "@nanoforge/physics-2d/collisions";
import { StaticBody2D } from "@nanoforge/physics-2d/components/static-body-2d";

import { AddToVarOnEnter2D } from "../components/add-to-var-on-enter-2d";
import { Collectible2D } from "../components/collectible-2d";

/**
 * Picks up the `Collectible2D` entities touched by an entity tagged with their `by`, or by any
 * entity but a `StaticBody2D`, a `Collectible2D` or an `AddToVarOnEnter2D` when `by` is empty:
 * their `amount` is added to their var, and they are removed. Add it after `detectCollisions2D` and `blockOnStaticBodies2D`, so a brick that is
 * collected still bounces the ball. Not on a network client: there, the server picks them up.
 *
 * @remarks
 * A var that doesn't exist yet counts as 0. The app needs a `SceneLibrary`.
 *
 * @system
 * @side shared
 */
export const collect2D = (registry: Registry, ctx: Context) => {
  // By id: registry.entityFromIndex throws for an entity removed earlier in the frame.
  const positions = registry.getComponents(Position2D);
  const statics = registry.getComponents(StaticBody2D);
  const coins = registry.getComponents(Collectible2D);
  const zones = registry.getComponents(AddToVarOnEnter2D);
  // An empty by: anything alive but a wall or another passive item of this package.
  const any = (other: number) =>
    positions.get(other) !== undefined &&
    !statics.get(other) &&
    !coins.get(other) &&
    !zones.get(other);
  const collected: number[] = [];

  registry.getIndexedZipper([Collectible2D]).forEach(({ id, Collectible2D }) => {
    const { variable, amount, by } = Collectible2D as Collectible2D;
    const picksUp = (other: number) => (by === "" ? any(other) : hasTag(registry, other, by));
    if (!touching(registry, registry.entityFromIndex(id)).some(picksUp)) return;

    const value = ctx.scenes.vars.get(variable);
    ctx.scenes.vars.set(variable, (typeof value === "number" ? value : 0) + amount);
    collected.push(id as number);
  });

  for (const id of collected) registry.killEntity(registry.entityFromIndex(id));
};
