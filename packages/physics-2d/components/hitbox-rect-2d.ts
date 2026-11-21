/**
 * Makes an entity collide as a rectangle whose top-left corner is its `Position2D`, plus its
 * offset. Needs the `detectCollisions2D` system.
 *
 * @remarks
 * `collisions` holds the ids of the entities it touched this frame, for your own systems.
 *
 * @component
 * @side shared
 * @group Size color=#5ec26a - Size of the hitbox.
 * @group Advanced hidden - Where the hitbox is, from the Position2D.
 */
export class HitboxRect2D {
  name = "HitboxRect2D";

  /** Ids of the entities touching this one, filled by `detectCollisions2D`. */
  collisions: number[] = [];

  constructor(
    /** In pixels. @group Size @preset size.width */
    public width = 50,
    /** In pixels. @group Size @preset size.height */
    public height = 50,
    /** Pixels from the `Position2D` to the hitbox's left edge, for a hitbox smaller than its sprite and centered on it. @group Advanced @preset vector.x */
    public offsetX = 0,
    /** Pixels from the `Position2D` to the hitbox's top edge. @group Advanced @preset vector.y */
    public offsetY = 0,
  ) {}
}
