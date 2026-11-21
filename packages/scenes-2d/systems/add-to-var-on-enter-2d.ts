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
 * Adds the `amount` of each `AddToVarOnEnter2D` to its var once for each entity tagged with its
 * `by` (any entity but a `StaticBody2D`, a `Collectible2D` or an `AddToVarOnEnter2D` when `by` is
 * empty) that touches it now and didn't at the
 * last frame. Add it after `detectCollisions2D` and `blockOnStaticBodies2D`, before `collect2D`.
 *
 * @remarks
 * A var that doesn't exist yet counts as 0. The app needs a `SceneLibrary`.
 *
 * @system
 * @side shared
 */
export const addToVarOnEnter2D = (registry: Registry, ctx: Context) => {
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

  registry.getIndexedZipper([AddToVarOnEnter2D]).forEach(({ id, AddToVarOnEnter2D }) => {
    const zone = AddToVarOnEnter2D as AddToVarOnEnter2D;
    const counts = (other: number) =>
      zone.by === "" ? any(other) : hasTag(registry, other, zone.by);
    const now = new Set(touching(registry, registry.entityFromIndex(id)).filter(counts));

    for (const other of now) {
      if (zone.inside.has(other)) continue;
      const value = ctx.scenes.vars.get(zone.variable);
      ctx.scenes.vars.set(zone.variable, (typeof value === "number" ? value : 0) + zone.amount);
    }
    zone.inside = now;
  });
};
