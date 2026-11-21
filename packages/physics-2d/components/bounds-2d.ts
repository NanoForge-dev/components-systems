/**
 * Keeps the entity inside an area: the screen, an arena, the map. Needs `Position2D` and the
 * `keepInBounds2D` system.
 *
 * @remarks
 * The entity's size is its hitbox with its offset, and a `HitboxCircle2D` counts as its bounding
 * square; without a hitbox, only its position counts. `clamp` also stops its `Velocity2D` against
 * the edge.
 *
 * @example
 * Asteroids that come back on the other side of an 800 by 600 screen:
 * `new Bounds2D(0, 0, 800, 600, "wrap")`. Bullets removed once off the screen: `"destroy"`.
 *
 * @component
 * @side shared
 * @group Area color=#5ec26a - The area, in world pixels: the screen's without a Camera2D.
 * @group Edge color=#f0a33a - What happens at its edge.
 */
export class Bounds2D {
  name = "Bounds2D";

  constructor(
    /** Left edge of the area. @group Area @preset vector.x */
    public left = 0,
    /** Top edge of the area. @group Area @preset vector.y */
    public top = 0,
    /** Width of the area, in pixels. @group Area @preset size.width */
    public areaWidth = 800,
    /** Height of the area, in pixels. @group Area @preset size.height */
    public areaHeight = 600,
    /** `clamp` stops it at the edge, `wrap` brings it back on the other side once it is out, `destroy` removes it once it is out. @group Edge */
    public mode: "clamp" | "wrap" | "destroy" = "clamp",
  ) {}
}
