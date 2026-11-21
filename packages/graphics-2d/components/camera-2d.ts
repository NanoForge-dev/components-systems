/**
 * Makes the view follow an entity: this one, or the one tagged `target`. Needs the
 * `followCamera2D` system, and a `Position2D` on the entity it follows.
 *
 * @remarks
 * The view keeps the entity in its middle (the middle of its `DrawableRect2D`, if it has one),
 * without showing past the edges of the world when they are set. `Hud2D` entities stay where they
 * are on the screen. Only the first `Camera2D` is used. On an entity of its own with `target`
 * `player`, the view stays where it is when the player is removed; while there is no `Camera2D`,
 * the world goes back in place.
 *
 * @component
 * @side client
 * @group View color=#4aa3ff - How the view follows the entity.
 * @group World color=#5ec26a - The edges the view never shows past: none while the world's width or height is 0.
 * @group Target color=#4aa3ff - What the view follows.
 */
export class Camera2D {
  name = "Camera2D";

  /** Where the world's layer is, set by `followCamera2D`. */
  viewX = 0;
  /** See `viewX`. */
  viewY = 0;
  /** Whether `followCamera2D` placed the view once: the first frame doesn't glide. */
  placed = false;

  constructor(
    /** 1 shows the world at its size, 2 twice as big. @group View */
    public zoom = 1,
    /** How slowly the view glides after the entity, in seconds: 0 sticks to it. @group View */
    public lag = 0.1,
    /** Left edge of the world, in pixels. @group World @preset vector.x */
    public left = 0,
    /** Top edge of the world, in pixels. @group World @preset vector.y */
    public top = 0,
    /** Width of the world, in pixels. @group World @preset size.width */
    public worldWidth = 0,
    /** Height of the world, in pixels. @group World @preset size.height */
    public worldHeight = 0,
    /** The `Tag` of the entity the view follows; empty: this entity (this entity first when it has the tag). @group Target */
    public target = "",
  ) {}
}
