import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import { Velocity2D } from "@nanoforge/basics-2d/components/velocity-2d";

import { RigidBody2D } from "../components/rigid-body-2d";
import { WalkAndJump2D } from "../components/walk-and-jump-2d";
import { walkedAxes } from "../walking";

/** A move from outside (a packet, code) from -1 to 1: a value that isn't a finite number is 0. */
const clampMove = (move: number) => (Number.isFinite(move) ? Math.max(-1, Math.min(1, move)) : 0);

/**
 * Walks and jumps each `WalkAndJump2D` entity: sets its `Velocity2D` from `moveX`/`moveY` and its
 * `speed` every frame, so an axis a wall stopped moves again, and jumps on `jumpRequested`. Add it
 * after the controls and AIs (`readKeyboard2D`, `chaseNearest2D`), before `applyGravity2D`.
 *
 * @remarks
 * A diagonal is capped at `speed`. Under its `RigidBody2D`'s gravity it never writes the vertical
 * velocity, which falls and jumps own. Not on a network client: the server moves the entity there.
 *
 * @system
 * @side shared
 */
export const walkAndJump2D = (registry: Registry, ctx: Context) => {
  const seconds = ctx.app.delta / 1000;

  registry
    .getIndexedZipper([WalkAndJump2D, Velocity2D])
    .forEach(({ id, WalkAndJump2D, Velocity2D }) => {
      const walker = WalkAndJump2D as WalkAndJump2D;
      const velocity = Velocity2D as Velocity2D;
      const body: RigidBody2D | undefined = registry.getEntityComponent(
        registry.entityFromIndex(id),
        RigidBody2D,
      );
      const gravity = body?.gravity ?? 0;
      const grounded = body?.grounded ?? false;

      const { x: writesX, y: writesY } = walkedAxes(walker, body);
      let x = writesX ? clampMove(walker.moveX) : 0;
      let y = writesY ? clampMove(walker.moveY) : 0;
      const length = Math.hypot(x, y);
      if (length > 1) {
        x /= length;
        y /= length;
      }
      if (writesX) velocity.x = x * walker.speed;
      if (writesY) velocity.y = y * walker.speed;

      if (grounded) {
        walker.coyoteTimer = walker.coyoteTime;
        walker.jumpsLeft = walker.maxJumps;
      } else {
        walker.coyoteTimer -= seconds;
      }
      const fresh = walker.jumpRequested;
      if (fresh) {
        walker.bufferTimer = walker.bufferTime;
        walker.jumpRequested = false;
      } else {
        walker.bufferTimer -= seconds;
      }

      // Walked off a ledge too long ago: the jump from the ground is lost.
      if (!grounded && walker.coyoteTimer <= 0 && walker.jumpsLeft === walker.maxJumps)
        walker.jumpsLeft--;
      // A fresh request always counts, so a `bufferTime` of 0 only turns buffering off.
      if ((!fresh && walker.bufferTimer <= 0) || walker.jumpsLeft <= 0 || gravity <= 0) return;

      velocity.y = -Math.sqrt(2 * gravity * walker.jumpHeight);
      walker.jumpsLeft--;
      walker.coyoteTimer = 0;
      walker.bufferTimer = 0;
    });
};
