/**
 * Makes an entity solid: a wall, a floor or a platform that `RigidBody2D` entities can't go
 * through. Needs `HitboxRect2D`.
 *
 * @component
 * @side shared
 * @group Platform color=#5ec26a - How it blocks.
 */
export class StaticBody2D {
  name = "StaticBody2D";

  constructor(
    /** Only blocks from above: entities jump through it from below and land on it. @group Platform */
    public oneWay = false,
  ) {}
}
