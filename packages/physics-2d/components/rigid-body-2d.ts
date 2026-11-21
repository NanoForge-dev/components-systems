/**
 * Makes an entity fall, and stop on (or bounce off) `StaticBody2D` entities. Needs `Velocity2D`, a
 * hitbox and the `applyGravity2D` and `blockOnStaticBodies2D` systems.
 *
 * @remarks
 * A `HitboxCircle2D` blocks as its bounding square. `grounded` tells whether it stands on a static
 * body, for animations and for the jumps of a `WalkAndJump2D`. A `WalkAndJump2D` needs no
 * `RigidBody2D` to stop at walls, only to fall and jump.
 *
 * @example
 * A pong or breakout ball, which doesn't fall and bounces off walls at full speed:
 * `new RigidBody2D(0, 1)`.
 *
 * @component
 * @side shared
 * @group Gravity color=#5ec26a - How the entity falls.
 * @group Bounce color=#f0a33a - What happens when it hits a static body.
 */
export class RigidBody2D {
  name = "RigidBody2D";

  /** Whether the entity stands on a static body, set by `blockOnStaticBodies2D`. */
  grounded = false;

  constructor(
    /** Added to the downward velocity every second, in pixels per second, per second. 0: it doesn't fall. @group Gravity */
    public gravity = 980,
    /** Share of its speed it keeps, going back, when it hits a static body: 0 stops it, 1 bounces it back at full speed. @group Bounce */
    public bounce = 0,
  ) {}
}
