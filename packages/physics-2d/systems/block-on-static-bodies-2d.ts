import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import { Position2D } from "@nanoforge/basics/components/position-2d";
import { Velocity2D } from "@nanoforge/basics/components/velocity-2d";

import { HitboxRect2D } from "../components/hitbox-rect-2d";
import { RigidBody2D } from "../components/rigid-body-2d";
import { StaticBody2D } from "../components/static-body-2d";

/**
 * Stops `RigidBody2D` entities from going through `StaticBody2D` entities: they are pushed out
 * of them, and stand on them (`grounded`). Both need a `HitboxRect2D`. Add it after
 * `detectCollisions2D`.
 *
 * @system
 * @side shared
 */
export function blockOnStaticBodies2D(registry: Registry, ctx: Context) {
  const seconds = ctx.app.delta / 1000;

  registry
    .getZipper([RigidBody2D, Position2D, Velocity2D, HitboxRect2D])
    .forEach(
      ({ RigidBody2D: body, Position2D: position, Velocity2D: velocity, HitboxRect2D: box }) => {
        body.grounded = false;

        for (const id of box.collisions as number[]) {
          const other = registry.entityFromIndex(id);
          const ground: StaticBody2D | undefined = registry.getEntityComponent(other, StaticBody2D);
          const groundPosition: Position2D | undefined = registry.getEntityComponent(
            other,
            Position2D,
          );
          const groundBox: HitboxRect2D | undefined = registry.getEntityComponent(
            other,
            HitboxRect2D,
          );
          if (!ground || !groundPosition || !groundBox) continue;

          const left = Math.max(position.x, groundPosition.x);
          const right = Math.min(position.x + box.width, groundPosition.x + groundBox.width);
          const top = Math.max(position.y, groundPosition.y);
          const bottom = Math.min(position.y + box.height, groundPosition.y + groundBox.height);
          // An earlier static body of this frame may already have pushed it out of this one.
          if (right <= left || bottom <= top) continue;

          // Landing first: its feet were above the top before this frame's move, so walking over
          // two floors side by side doesn't push it sideways at the seam.
          const feetBefore = position.y + box.height - velocity.y * seconds;
          if (velocity.y >= 0 && feetBefore <= groundPosition.y + 1) {
            land(position, velocity, body, groundPosition.y - box.height);
          } else if (ground.oneWay) {
            continue;
          } else if (bottom - top <= right - left) {
            const above = position.y + box.height / 2 < groundPosition.y + groundBox.height / 2;
            if (above) land(position, velocity, body, groundPosition.y - box.height);
            else {
              position.y = groundPosition.y + groundBox.height;
              velocity.y = Math.max(velocity.y, 0);
            }
          } else {
            const toTheLeft = position.x + box.width / 2 < groundPosition.x + groundBox.width / 2;
            position.x = toTheLeft
              ? groundPosition.x - box.width
              : groundPosition.x + groundBox.width;
            velocity.x = 0;
          }
        }
      },
    );
}

const land = (position: Position2D, velocity: Velocity2D, body: RigidBody2D, y: number) => {
  position.y = y;
  velocity.y = Math.min(velocity.y, 0);
  body.grounded = true;
};
