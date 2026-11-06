/**
 * Makes an entity collide as a circle whose center is its `Position2D`. Needs the
 * `detectCollisions2D` system.
 *
 * @remarks
 * `collisions` holds the ids of the entities it touched this frame, for your own systems.
 *
 * @component
 * @side shared
 * @group Size color=#5ec26a - Size of the hitbox.
 */
export class HitboxCircle2D {
  name = "HitboxCircle2D";

  /** Ids of the entities touching this one, filled by `detectCollisions2D`. */
  collisions: number[] = [];

  constructor(
    /** In pixels. @group Size */
    public radius = 25,
  ) {}
}
