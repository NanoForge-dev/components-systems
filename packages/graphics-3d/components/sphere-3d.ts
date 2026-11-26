import "@nanoforge-dev/graphics-3d/three";

/**
 * Shows the entity as a lit ball. Add `draw3D` to show it, and `Position3D`, `Rotation3D` or
 * `Scale3D` (basics-3d) to place it.
 *
 * @component
 * @side client
 * @group Sphere color=#ff9f43 - Size and color.
 */
export class Sphere3D {
  name = "Sphere3D";

  constructor(
    /** Units from the center to the surface. @group Sphere */
    public radius = 0.5,
    /** Any CSS color. @group Sphere @preset color */
    public color = "#ffffff",
  ) {}
}
