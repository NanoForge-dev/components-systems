/**
 * Turns the drawable toward the entity tagged `target`: eyes following the player, a turret
 * watching it, an arrow pointing at a goal. Needs `Position2D`, a `DrawableRect2D`,
 * `DrawableCircle2D` or `DrawableText2D`, and the `faceTarget2D` system.
 *
 * @remarks
 * To face the mouse, add a cursor entity with `FollowMouse2D` (from `@nanoforge/controls-2d`) and
 * `Tag("cursor")`, and set `target` to `cursor`. Don't combine it with `FaceVelocity2D` or
 * `FaceAim2D`; with a `MoveAnimation2D`, turn its `flip` off. While no entity has the tag, it keeps
 * its look.
 *
 * @component
 * @side client
 * @group Facing color=#e86fb0 - What it looks at.
 * @group Advanced hidden - Less common settings.
 */
export class FaceTarget2D {
  name = "FaceTarget2D";

  constructor(
    /** The `Tag` of what it looks at. @group Facing */
    public target = "player",
    /** Which way the image is drawn looking. @group Facing */
    public imageFacing: "right" | "up" | "left" | "down" = "right",
    /** Mirrored instead of upside down while looking the other way (a `DrawableRect2D` drawn right or left). @group Advanced */
    public keepUpright = false,
  ) {}
}
