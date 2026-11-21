/**
 * Keeps the entity on the mouse cursor: a crosshair, a custom cursor, an object being placed.
 * Needs `Position2D` and the `followMouse2D` system.
 *
 * @remarks
 * The middle of a `DrawableRect2D` is on the cursor, or its top-left corner with `centered` off;
 * a circle's position is already its center. Give it `Tag("cursor")` for a `FaceTarget2D` or a
 * `Follow2D` to find it. A client-only convenience: a server never sees this position.
 *
 * @component
 * @side client
 * @group Advanced hidden - Less common settings.
 */
export class FollowMouse2D {
  name = "FollowMouse2D";

  constructor(
    /** Whether the middle of its DrawableRect2D is on the cursor; off: its top-left corner, an arrow cursor's tip. @group Advanced */
    public centered = true,
  ) {}
}
