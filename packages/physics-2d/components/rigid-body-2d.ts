/**
 * Makes an entity fall, and stop on `StaticBody2D` entities. Needs `Velocity2D`, `HitboxRect2D`
 * and the `applyGravity2D` and `blockOnStaticBodies2D` systems.
 *
 * @remarks
 * `grounded` tells whether it stands on a static body, for jumps or animations.
 *
 * @component
 * @side shared
 * @group Gravity color=#5ec26a - How the entity falls.
 */
export class RigidBody2D {
  name = "RigidBody2D";

  /** Whether the entity stands on a static body, set by `blockOnStaticBodies2D`. */
  grounded = false;

  constructor(
    /** Added to the downward velocity every second, in pixels per second, per second. 0: it doesn't fall. @group Gravity */
    public gravity = 980,
  ) {}
}
