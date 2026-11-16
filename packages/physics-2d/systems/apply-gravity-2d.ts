import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import { Velocity2D } from "@nanoforge/basics-2d/components/velocity-2d";

import { RigidBody2D } from "../components/rigid-body-2d";

/**
 * Makes `RigidBody2D` entities fall: their `gravity` is added to their downward `Velocity2D`.
 * Add it before `move2D`.
 *
 * @system
 * @side shared
 */
export function applyGravity2D(registry: Registry, ctx: Context) {
  const seconds = ctx.app.delta / 1000;

  registry.getZipper([RigidBody2D, Velocity2D]).forEach(({ RigidBody2D, Velocity2D }) => {
    Velocity2D.y += RigidBody2D.gravity * seconds;
  });
}
