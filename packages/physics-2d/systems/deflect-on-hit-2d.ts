import type { Registry } from "@nanoforge-dev/ecs";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { Velocity2D } from "@nanoforge/basics-2d/components/velocity-2d";

import { boxOf, touching } from "../collisions";
import { DeflectOnHit2D } from "../components/deflect-on-hit-2d";
import { RigidBody2D } from "../components/rigid-body-2d";

/** Where each `DeflectOnHit2D.direction` sends what hits its middle. */
const NORMALS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] } as const;

/**
 * Sends each body that bounces (a `RigidBody2D` with a `bounce`) and moves into a `DeflectOnHit2D`
 * it touches toward that one's `direction`, turned toward the end it hit. Add it after
 * `detectCollisions2D` and `blockOnStaticBodies2D`.
 *
 * @remarks
 * The angle grows with the distance from the middle, up to `maxAngle` at an end, and the speed is
 * multiplied by `speedUp`, up to `maxSpeed` (a body already faster keeps its speed). The body is
 * put back against the face. Both hitboxes work, offsets included: a circle counts as its bounding
 * square.
 *
 * @system
 * @side shared
 */
export const deflectOnHit2D = (registry: Registry) => {
  const bodies = registry.getComponents(RigidBody2D);
  registry
    .getIndexedZipper([DeflectOnHit2D, Position2D])
    .forEach(({ id, DeflectOnHit2D, Position2D: at }) => {
      const deflector = DeflectOnHit2D as DeflectOnHit2D;
      const entity = registry.entityFromIndex(id);
      const face = boxOf(registry, entity, at);
      if (!face) return;
      const [normalX, normalY] = NORMALS[deflector.direction];
      // Along the face: its normal turned a quarter clockwise.
      const alongX = -normalY;
      const alongY = normalX;
      const length = Math.abs(alongX) * face.width + Math.abs(alongY) * face.height;

      for (const other of touching(registry, entity)) {
        // By id first: registry.entityFromIndex throws for an entity removed earlier this frame.
        const body = bodies.get(other) as RigidBody2D | undefined | null;
        if (!body || body.bounce <= 0) continue;
        const hit = registry.entityFromIndex(other);
        const position: Position2D | undefined = registry.getEntityComponent(hit, Position2D);
        const velocity: Velocity2D | undefined = registry.getEntityComponent(hit, Velocity2D);
        const box = position && boxOf(registry, hit, position);
        if (!position || !velocity || !box) continue;
        // Only a body coming at the face: one leaving it already bounced.
        if (velocity.x * normalX + velocity.y * normalY >= 0) continue;

        const offset =
          (alongX * (box.x + box.width / 2 - face.x - face.width / 2) +
            alongY * (box.y + box.height / 2 - face.y - face.height / 2)) /
          (length / 2);
        const angle = (Math.max(-1, Math.min(1, offset)) * deflector.maxAngle * Math.PI) / 180;
        const before = Math.hypot(velocity.x, velocity.y);
        const speed = Math.min(before * deflector.speedUp, Math.max(before, deflector.maxSpeed));
        velocity.x = speed * (normalX * Math.cos(angle) + alongX * Math.sin(angle));
        velocity.y = speed * (normalY * Math.cos(angle) + alongY * Math.sin(angle));
        // The body's box goes against the face, and its position moves with it.
        if (normalX > 0) position.x += face.x + face.width - box.x;
        if (normalX < 0) position.x += face.x - box.width - box.x;
        if (normalY > 0) position.y += face.y + face.height - box.y;
        if (normalY < 0) position.y += face.y - box.height - box.y;
      }
    });
};
