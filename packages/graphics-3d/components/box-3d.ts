import "@nanoforge-dev/graphics-3d/three";

/**
 * Shows the entity as a lit box. Add `draw3D` to show it, and `Position3D`, `Rotation3D` or
 * `Scale3D` (basics-3d) to place it.
 *
 * @example
 * `new Box3D(1, 1, 1, "#44aa88")` is a green cube of one unit.
 *
 * @component
 * @side client
 * @group Box color=#ff9f43 - Size and color.
 */
export class Box3D {
  name = "Box3D";

  constructor(
    /** Units along the x axis. @group Box */
    public width = 1,
    /** Units along the y axis (up). @group Box */
    public height = 1,
    /** Units along the z axis. @group Box */
    public depth = 1,
    /** Any CSS color. @group Box @preset color */
    public color = "#ffffff",
  ) {}
}
