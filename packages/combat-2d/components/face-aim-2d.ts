/**
 * Turns the entity's drawable toward where its `Shoot2D` aims: a turret, a hero looking at the
 * cursor, a gun. Needs `Shoot2D`, a `DrawableRect2D`, `DrawableCircle2D` or `DrawableText2D`, and
 * the `faceAim2D` system.
 *
 * @remarks
 * Don't combine it with `FaceVelocity2D` or `FaceTarget2D`. With a `MoveAnimation2D`, turn its
 * `flip` off. To face something without a `Shoot2D`, use `FaceTarget2D` (`@nanoforge/graphics-2d`).
 * While the aim is (0, 0), it keeps its look.
 *
 * @component
 * @side client
 * @group Facing color=#e86fb0 - Which way the drawable looks.
 * @group Advanced hidden - Less common settings.
 */
export class FaceAim2D {
  name = "FaceAim2D";

  constructor(
    /** Which way the image is drawn looking. @group Facing */
    public imageFacing: "right" | "up" | "left" | "down" = "right",
    /** Mirrored instead of upside down while it aims the other way (a `DrawableRect2D` drawn looking right or left). @group Advanced */
    public keepUpright = false,
  ) {}
}
