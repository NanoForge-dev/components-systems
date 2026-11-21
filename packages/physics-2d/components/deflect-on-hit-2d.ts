/**
 * Sends what bounces off it toward `direction`, at a wider angle the further from its middle it is
 * hit, up to `maxAngle`: a pong or breakout paddle, a bumper. What bounces is a `RigidBody2D` with a
 * `bounce`. Needs `Position2D`, a hitbox (`HitboxRect2D` or `HitboxCircle2D`) and the
 * `deflectOnHit2D` system.
 *
 * @remarks
 * Move it with a `WalkAndJump2D`, which walls (`StaticBody2D`) stop: `new WalkAndJump2D(1000,
 * "vertical")` for a pong paddle, with a `KeyboardControls2D` from `@nanoforge/controls-2d` to play
 * it.
 *
 * @example
 * The left paddle of a pong sends the ball to the right: `new DeflectOnHit2D("right")`. A breakout
 * paddle sends it up: `new DeflectOnHit2D()`.
 *
 * @component
 * @side shared
 * @group Deflect color=#4aa3ff - Where what bounces off it goes.
 * @group Advanced hidden - Less common settings.
 */
export class DeflectOnHit2D {
  name = "DeflectOnHit2D";

  constructor(
    /** Where what hits its middle goes. @group Deflect */
    public direction: "up" | "down" | "left" | "right" = "up",
    /** Angle off that direction when hit at an end, in degrees. @group Deflect */
    public maxAngle = 60,
    /** The speed of what bounces off it is multiplied by it at each hit: 1 keeps it. @group Advanced */
    public speedUp = 1,
    /** The most `speedUp` takes it to, in pixels per second: a faster body can go through walls. @group Advanced */
    public maxSpeed = 1600,
  ) {}
}
