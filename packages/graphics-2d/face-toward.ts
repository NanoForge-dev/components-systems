import { DrawableRect2D } from "./components/drawable-rect-2d";
import type { Drawable2D } from "./drawable-of";

/** Which way an image is drawn looking. */
export type ImageFacing = "right" | "up" | "left" | "down";

/** Each facing's angle, clockwise from the right in degrees: the screen's y goes down. */
const FACING_ANGLES: Record<ImageFacing, number> = { right: 0, down: 90, left: 180, up: -90 };

/**
 * Turns `drawable`, an image drawn looking `imageFacing`, toward the direction (`dx`, `dy`); it
 * changes nothing for (0, 0). With `keepUpright`, a `DrawableRect2D` drawn looking right or left
 * is mirrored instead of turned upside down while it looks the other way; a `DrawableRect2D` is
 * otherwise never mirrored. Used by `faceVelocity2D`, `faceTarget2D` and `faceAim2D`.
 */
export const faceToward = (
  drawable: Drawable2D,
  dx: number,
  dy: number,
  imageFacing: ImageFacing,
  keepUpright: boolean,
): void => {
  if (dx === 0 && dy === 0) return;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const facing = FACING_ANGLES[imageFacing];
  let mirrored = false;
  if (drawable instanceof DrawableRect2D) {
    // The sign of dx is the sign of the angle's cosine; straight up or down keeps the mirroring.
    if (keepUpright && imageFacing === "right") mirrored = dx === 0 ? drawable.flipX : dx < 0;
    else if (keepUpright && imageFacing === "left") mirrored = dx === 0 ? drawable.flipX : dx > 0;
    drawable.flipX = mirrored;
  }
  drawable.rotation = angle - (mirrored ? facing + 180 : facing);
};
