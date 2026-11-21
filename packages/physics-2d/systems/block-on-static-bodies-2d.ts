import type { Context } from "@nanoforge-dev/common";
import type { Entity, Registry } from "@nanoforge-dev/ecs";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { Velocity2D } from "@nanoforge/basics-2d/components/velocity-2d";

import { type Box, boxOf, touching } from "../collisions";
import { RigidBody2D } from "../components/rigid-body-2d";
import { StaticBody2D } from "../components/static-body-2d";
import { WalkAndJump2D } from "../components/walk-and-jump-2d";

/**
 * Stops `RigidBody2D` and `WalkAndJump2D` entities from going through `StaticBody2D` entities:
 * they are pushed out of them, and a rigid body stands on them (`grounded`), or bounces off them by
 * its `bounce`. Both need a hitbox. Add it after `detectCollisions2D`.
 *
 * @remarks
 * A `HitboxCircle2D` blocks and is blocked as its bounding square. A `WalkAndJump2D` without a
 * `RigidBody2D` stops at walls without bouncing. It is pushed back to the side it came from, so a
 * thin or fast box doesn't slide through, unless one frame's move carries it past the whole wall.
 *
 * @system
 * @side shared
 */
export function blockOnStaticBodies2D(registry: Registry, ctx: Context) {
  const seconds = ctx.app.delta / 1000;

  registry
    .getIndexedZipper([RigidBody2D, Position2D, Velocity2D])
    .forEach(({ id, RigidBody2D, Position2D, Velocity2D }) =>
      block(registry, registry.entityFromIndex(id), Position2D, Velocity2D, RigidBody2D, seconds),
    );
  registry
    .getIndexedZipper([WalkAndJump2D, Position2D, Velocity2D])
    .forEach(({ id, Position2D, Velocity2D }) => {
      const entity = registry.entityFromIndex(id);
      // Done above, with its bounce.
      if (registry.getEntityComponent(entity, RigidBody2D)) return;
      block(registry, entity, Position2D, Velocity2D, undefined, seconds);
    });
}

/** Pushes `entity` out of the static bodies it touches; without a `body`, it never bounces. */
const block = (
  registry: Registry,
  entity: Entity,
  position: Position2D,
  velocity: Velocity2D,
  body: RigidBody2D | undefined,
  seconds: number,
) => {
  const start = boxOf(registry, entity, position);
  if (!start) return;
  // Where it was before this frame's move: the side it came from, whatever the frame rate.
  const before = { ...start, x: start.x - velocity.x * seconds, y: start.y - velocity.y * seconds };
  // By id: registry.entityFromIndex throws for an entity removed earlier in the frame.
  const grounds = registry.getComponents(StaticBody2D);
  if (body) body.grounded = false;
  const bounce = body?.bounce ?? 0;
  const land = (box: Box, top: number) => {
    position.y = top - box.height - (box.y - position.y);
    if (velocity.y > 0) velocity.y = rebound(velocity.y, bounce);
    if (body) body.grounded = true;
  };

  for (const id of touching(registry, entity)) {
    const ground = grounds.get(id) as StaticBody2D | undefined | null;
    if (!ground) continue;
    const other = registry.entityFromIndex(id);
    const groundPosition: Position2D | undefined = registry.getEntityComponent(other, Position2D);
    const wall = ground && groundPosition && boxOf(registry, other, groundPosition);
    // Again for each static body: an earlier one of this frame may have pushed it.
    const box = boxOf(registry, entity, position);
    if (!wall || !box) continue;

    const left = Math.max(box.x, wall.x);
    const right = Math.min(box.x + box.width, wall.x + wall.width);
    const top = Math.max(box.y, wall.y);
    const bottom = Math.min(box.y + box.height, wall.y + wall.height);
    // An earlier static body of this frame may already have pushed it out of this one.
    if (right <= left || bottom <= top) continue;

    // Landing first: its feet were above the top before this frame's move, so walking over two
    // floors side by side doesn't push it sideways at the seam.
    const feetBefore = box.y + box.height - velocity.y * seconds;
    if (velocity.y >= 0 && feetBefore <= wall.y + 1) {
      land(box, wall.y);
      continue;
    }
    if (ground.oneWay) continue;
    // Beside the wall on one axis only before its move: pushed back on the other. Else (it was
    // already inside, or came in diagonally) on the axis it overlaps least.
    const besideX = before.x >= wall.x + wall.width || before.x + before.width <= wall.x;
    const besideY = before.y >= wall.y + wall.height || before.y + before.height <= wall.y;
    const from = besideX || besideY ? before : box;
    if (besideX !== besideY ? besideY : bottom - top <= right - left) {
      const above = from.y + from.height / 2 < wall.y + wall.height / 2;
      if (above) land(box, wall.y);
      else {
        position.y = wall.y + wall.height - (box.y - position.y);
        if (velocity.y < 0) velocity.y = rebound(velocity.y, bounce);
      }
    } else {
      const toTheLeft = from.x + from.width / 2 < wall.x + wall.width / 2;
      position.x = (toTheLeft ? wall.x - box.width : wall.x + wall.width) - (box.x - position.x);
      // A body already going away keeps going, unless it never bounces (then it stops).
      if (bounce === 0 || (toTheLeft ? velocity.x > 0 : velocity.x < 0))
        velocity.x = rebound(velocity.x, bounce);
    }
  }
};

/** The speed after a hit at `speed`: none, or a share of it the other way. */
const rebound = (speed: number, bounce: number) => (bounce > 0 ? -speed * bounce : 0);
