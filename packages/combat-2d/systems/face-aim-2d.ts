import type { Registry } from "@nanoforge-dev/ecs";
import { drawableOf } from "@nanoforge/graphics-2d/drawable-of";
import { faceToward } from "@nanoforge/graphics-2d/face-toward";

import { FaceAim2D } from "../components/face-aim-2d";
import { Shoot2D } from "../components/shoot-2d";

/**
 * Turns the drawable of each `FaceAim2D` entity toward where its `Shoot2D` aims. Add it after
 * `animateMoves2D`, `faceVelocity2D` and `faceTarget2D`, so its facing wins.
 *
 * @remarks
 * A (0, 0) or invalid aim leaves the drawable as it is.
 *
 * @system
 * @side client
 */
export const faceAim2D = (registry: Registry) => {
  registry.getIndexedZipper([FaceAim2D, Shoot2D]).forEach(({ id, FaceAim2D, Shoot2D }) => {
    const face = FaceAim2D as FaceAim2D;
    const { aimX, aimY } = Shoot2D as Shoot2D;
    const drawable = drawableOf(registry, registry.entityFromIndex(id));
    if (drawable && Number.isFinite(aimX) && Number.isFinite(aimY))
      faceToward(drawable, aimX, aimY, face.imageFacing, face.keepUpright);
  });
};
