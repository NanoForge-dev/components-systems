/**
 * Makes an entity collide as a rectangle whose top-left corner is its `Position2D`. Needs the
 * `detectCollisions2D` system.
 *
 * @remarks
 * `collisions` holds the ids of the entities it touched this frame, for your own systems.
 *
 * @component
 * @side shared
 * @group Size color=#5ec26a - Size of the hitbox.
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
  ) {}
}
