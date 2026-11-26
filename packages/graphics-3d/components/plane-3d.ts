import "@nanoforge-dev/graphics-3d/three";

/**
 * Shows the entity as a flat lit rectangle, seen from both sides. Add `draw3D` to show it, and
 * `Position3D`, `Rotation3D` or `Scale3D` (basics-3d) to place it.
 *
 * @remarks
 * It stands upright, facing the z axis. Lay it down as a ground with `Rotation3D(-90, 0, 0)`.
 *
 * @component
 * @side client
 * @group Plane color=#ff9f43 - Size and color.
 */
export class Plane3D {
  name = "Plane3D";

  constructor(
    /** Units along the x axis. @group Plane */
    public width = 1,
    /** Units along the y axis, before any rotation. @group Plane */
    public height = 1,
    /** Any CSS color. @group Plane @preset color */
    public color = "#ffffff",
  ) {}
}
