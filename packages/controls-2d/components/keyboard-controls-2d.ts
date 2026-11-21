import { InputEnum } from "@nanoforge-dev/input";

/**
 * Drives the entity with the keyboard and the mouse: the arrows walk its `WalkAndJump2D`
 * (`@nanoforge/physics-2d`), Space jumps, and the left mouse button fires its `Shoot2D`
 * (`@nanoforge/combat-2d`) toward the cursor. Each part works when the entity has that component.
 * Needs the `readKeyboard2D` system.
 *
 * @remarks
 * What it read this frame stays in `moveX`, `moveY`, `jump`, `fire`, `aimX` and `aimY`: a network
 * client sends it from there.
 *
 * The mouse aims from the middle of the hitbox, once the mouse moved or a mouse button was held.
 * Until then, and after a gamepad stick aimed, its `Shoot2D` keeps its aim.
 *
 * A mouse button doesn't fire over a `Clickable2D`, or while dragging a `Draggable2D`.
 *
 * @example
 * Two paddles on one keyboard:
 * `new KeyboardControls2D(InputEnum.ArrowLeft, InputEnum.ArrowRight, InputEnum.KeyW, InputEnum.KeyS)`
 * and `new KeyboardControls2D()`.
 *
 * @component
 * @side client
 * @group Move color=#9d7bff - The keys that walk it.
 * @group Jump color=#5ec26a - The key that jumps.
 * @group Fire color=#e5484d - What fires its Shoot2D, and what aims it.
 */
export class KeyboardControls2D {
  name = "KeyboardControls2D";

  /** Where the keys walk it this frame, from -1 (left) to 1 (right), set by `readKeyboard2D`. */
  moveX = 0;
  /** Where the keys walk it this frame, from -1 (up) to 1 (down), set by `readKeyboard2D`. */
  moveY = 0;
  /** Whether `jumpKey` is held this frame, set by `readKeyboard2D`. */
  jump = false;
  /** Whether it fires this frame, set by `readKeyboard2D`. */
  fire = false;
  /** The last aim it wrote, a direction: (0, 0) until it aims. Set by `readKeyboard2D`. */
  aimX = 0;
  /** See `aimX`. */
  aimY = 0;
  /** Whether the mouse aims: set when the mouse moves or a mouse button is held, cleared when a gamepad stick aims. */
  mouseAiming = false;

  constructor(
    /** @group Move */
    public left: InputEnum = InputEnum.ArrowLeft,
    /** @group Move */
    public right: InputEnum = InputEnum.ArrowRight,
    /** @group Move */
    public up: InputEnum = InputEnum.ArrowUp,
    /** @group Move */
    public down: InputEnum = InputEnum.ArrowDown,
    /** Pressed to jump. @group Jump */
    public jumpKey: InputEnum = InputEnum.Space,
    /** The key or mouse button held to fire. @group Fire */
    public fireKey: InputEnum = InputEnum.MouseLeft,
    /** What aims its Shoot2D: the cursor, the way the move keys point, or nothing. @group Fire */
    public aimWith: "mouse" | "moveKeys" | "none" = "mouse",
  ) {}
}
