import type { Registry } from "@nanoforge-dev/ecs";
import { Velocity2D } from "@nanoforge/basics-2d/components/velocity-2d";

import { FaceVelocity2D } from "../components/face-velocity-2d";
import { drawableOf } from "../drawable-of";
import { faceToward } from "../face-toward";

/**
 * Turns the drawable of each `FaceVelocity2D` entity toward its `Velocity2D`. Add it after the
 * systems that move entities and after `animateMoves2D`, before `draw2D`.
 *
 * @system
 * @side client
 */
export const faceVelocity2D = (registry: Registry) => {
  registry
    .getIndexedZipper([FaceVelocity2D, Velocity2D])
    .forEach(({ id, FaceVelocity2D, Velocity2D }) => {
      const face = FaceVelocity2D as FaceVelocity2D;
      const velocity = Velocity2D as Velocity2D;
      if (velocity.x === 0 && velocity.y === 0) return;
      const drawable = drawableOf(registry, registry.entityFromIndex(id));
      if (drawable)
        faceToward(drawable, velocity.x, velocity.y, face.imageFacing, face.keepUpright);
    });
};
