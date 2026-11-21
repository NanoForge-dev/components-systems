import { ControllerButton } from "@nanoforge-dev/input/controller";

/**
 * Drives the entity with a gamepad: the left stick or the D-pad walks its `WalkAndJump2D`
 * (`@nanoforge/physics-2d`), A jumps, the right stick aims its `Shoot2D` (`@nanoforge/combat-2d`),
 * and the right trigger fires it. Each part works when the entity has that component. Needs the
 * `readGamepad2D` system and the game's `ControllerLibrary`.
 *
 * @remarks
 * What it read this frame stays in `moveX`, `moveY`, `jump`, `fire`, `aimX` and `aimY`. With a
 * `KeyboardControls2D` too, both devices work, and a pushed stick wins.
 *
 * @component
 * @side client
 * @group Gamepad color=#9d7bff - Which gamepad, and what its buttons do.
 */
export class GamepadControls2D {
  name = "GamepadControls2D";

  /** Where it walks this frame, from -1 (left) to 1 (right), set by `readGamepad2D`. */
  moveX = 0;
  /** Where it walks this frame, from -1 (up) to 1 (down), set by `readGamepad2D`. */
  moveY = 0;
  /** Whether `jumpButton` is held this frame, set by `readGamepad2D`. */
  jump = false;
  /** Whether `fireButton` is held this frame, set by `readGamepad2D`. */
  fire = false;
  /** The last aim it wrote, a direction: (0, 0) until a stick aims. Set by `readGamepad2D`. */
  aimX = 0;
  /** See `aimX`. */
  aimY = 0;

  constructor(
    /** 0 for the first one plugged in. @group Gamepad */
    public gamepad = 0,
    /** Pressed to jump. @group Gamepad */
    public jumpButton: ControllerButton = ControllerButton.A,
    /** Held to fire. @group Gamepad */
    public fireButton: ControllerButton = ControllerButton.RightTrigger,
    /** What aims its Shoot2D; leftStick aims where it walks, for a pad without a right stick or a platformer. @group Gamepad */
    public aimWith: "rightStick" | "leftStick" | "none" = "rightStick",
  ) {}
}
