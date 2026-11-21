/**
 * Walks the entity where it is told, at its speed, and jumps when it has a `RigidBody2D` with
 * gravity. `moveX`/`moveY` and `jumpRequested` say what to do: a `KeyboardControls2D` or
 * `GamepadControls2D` (`@nanoforge/controls-2d`) fills them on the client; a `ChaseNearest2D`,
 * your system or the server's packet handler can fill them instead. Needs `Velocity2D` and the
 * `walkAndJump2D` system.
 *
 * @remarks
 * `StaticBody2D` walls stop it, with or without a `RigidBody2D`. Under gravity it walks left and
 * right only; without gravity it never jumps.
 *
 * @example
 * A platformer hero is `new WalkAndJump2D()` with a `RigidBody2D()`; a top-down hero is
 * `new WalkAndJump2D()` alone; a pong paddle is `new WalkAndJump2D(1000, "vertical")`.
 *
 * @component
 * @side shared
 * @group Walk color=#9d7bff - How it walks.
 * @group Jump color=#5ec26a - How it jumps, under its RigidBody2D's gravity.
 * @group Advanced hidden - Small delays that make jumps feel fair.
 */
export class WalkAndJump2D {
  name = "WalkAndJump2D";

  /** Where it walks, from -1 (left) to 1 (right): set by a control, an AI or the server, never cleared. */
  moveX = 0;
  /** Where it walks, from -1 (up) to 1 (down): set by a control, an AI or the server, never cleared. */
  moveY = 0;
  /** Jump now: set by a control on a fresh press, an AI or the server; cleared by `walkAndJump2D`, which keeps it `bufferTime` seconds while it can't jump. */
  jumpRequested = false;
  /** Jumps left before landing again, set by `walkAndJump2D`. */
  jumpsLeft = 0;
  /** Seconds left to jump after walking off a ledge, counted down by `walkAndJump2D`. */
  coyoteTimer = 0;
  /** Seconds left during which a jump asked for waits to happen, counted down by `walkAndJump2D`. */
  bufferTimer = 0;

  constructor(
    /** Pixels per second, pushed all the way. @group Walk */
    public speed = 200,
    /** Which directions it walks in: vertical for a pong paddle; horizontal only under gravity. @group Walk */
    public axes: "both" | "horizontal" | "vertical" = "both",
    /** How high a jump goes, in pixels. @group Jump */
    public jumpHeight = 128,
    /** Jumps before landing again: 2 for a double jump. @group Jump */
    public maxJumps = 1,
    /** Seconds after walking off a ledge during which a jump still works. @group Advanced */
    public coyoteTime = 0.1,
    /** Seconds a jump asked for just before landing is kept. @group Advanced */
    public bufferTime = 0.1,
  ) {}
}
