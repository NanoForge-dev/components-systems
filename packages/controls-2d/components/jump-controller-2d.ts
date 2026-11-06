import { InputEnum } from "@nanoforge-dev/input";

/**
 * Makes an entity jump with a key. Needs `Velocity2D`, `RigidBody2D` and the `jumpControl2D`
 * system.
 *
 * @component
 * @side client
 * @group Jump color=#9d7bff - How the entity jumps.
 * @group Feel hidden - Small delays that make jumps feel fair.
 */
export class JumpController2D {
  name = "JumpController2D";

  /** Jumps left before landing again. */
  jumpsLeft = 0;
  /** Seconds left to jump after walking off a ledge. */
  coyoteTimer = 0;
  /** Seconds left during which a press waits to become a jump. */
  bufferTimer = 0;
  /** Whether the key was down last frame. */
  wasPressed = false;

  constructor(
    /** The key that jumps. @group Jump */
    public key: InputEnum = InputEnum.Space,
    /** Upward speed of a jump, in pixels per second. @group Jump */
    public strength = 500,
    /** Jumps before landing again: 2 for a double jump. @group Jump */
    public maxJumps = 1,
    /** Seconds after walking off a ledge during which a jump still works. @group Feel */
    public coyoteTime = 0.1,
    /** Seconds a press just before landing is kept, to jump as soon as it lands. @group Feel */
    public bufferTime = 0.1,
  ) {}
}
