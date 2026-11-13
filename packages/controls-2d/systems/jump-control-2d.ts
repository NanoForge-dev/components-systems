import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import "@nanoforge-dev/input";
import { Velocity2D } from "@nanoforge/basics-2d/components/velocity-2d";
import { RigidBody2D } from "@nanoforge/physics-2d/components/rigid-body-2d";

import { JumpController2D } from "../components/jump-controller-2d";

/**
 * Makes `JumpController2D` entities jump when their key is pressed, while they stand on the
 * ground (or have jumps left). Add it before `applyGravity2D`.
 *
 * @system
 * @side client
 */
export function jumpControl2D(registry: Registry, ctx: Context) {
  const seconds = ctx.app.delta / 1000;

  registry
    .getZipper([JumpController2D, RigidBody2D, Velocity2D])
    .forEach(({ JumpController2D: jump, RigidBody2D, Velocity2D }) => {
      const controller = jump as JumpController2D;
      const pressed = ctx.input.isKeyPressed(controller.key) === true;

      if (RigidBody2D.grounded) {
        controller.coyoteTimer = controller.coyoteTime;
        controller.jumpsLeft = controller.maxJumps;
      } else {
        controller.coyoteTimer -= seconds;
      }
      const fresh = pressed && !controller.wasPressed;
      controller.bufferTimer = fresh ? controller.bufferTime : controller.bufferTimer - seconds;
      controller.wasPressed = pressed;

      // Walked off a ledge too long ago: the jump from the ground is lost.
      if (
        !RigidBody2D.grounded &&
        controller.coyoteTimer <= 0 &&
        controller.jumpsLeft === controller.maxJumps
      )
        controller.jumpsLeft--;
      // A fresh press always counts, so a `bufferTime` of 0 only turns buffering off.
      if ((!fresh && controller.bufferTimer <= 0) || controller.jumpsLeft <= 0) return;

      Velocity2D.y = -controller.strength;
      controller.jumpsLeft--;
      controller.coyoteTimer = 0;
      controller.bufferTimer = 0;
    });
}
