/**
 * Turns the entity's drawable toward where it moves: a car, an arrow, a fish. Needs `Velocity2D`,
 * a `DrawableRect2D`, `DrawableCircle2D` or `DrawableText2D`, and the `faceVelocity2D` system.
 *
 * @remarks
 * Set `imageFacing` to the way the image is drawn looking. While the entity stands still, it keeps
 * looking the way it went. Don't combine it with `FaceAim2D` or `FaceTarget2D`; with a
 * `MoveAnimation2D`, turn its `flip` off.
 *
 * @component
 * @side client
 * @group Facing color=#e86fb0 - Which way the drawable looks.
 * @group Advanced hidden - Less common settings.
 */
export class FaceVelocity2D {
  name = "FaceVelocity2D";

  constructor(
    /** Which way the image is drawn looking. @group Facing */
    public imageFacing: "right" | "up" | "left" | "down" = "right",
    /** For a `DrawableRect2D` drawn looking right or left: mirrored instead of upside down while it goes the other way. @group Advanced */
    public keepUpright = false,
  ) {}
}
