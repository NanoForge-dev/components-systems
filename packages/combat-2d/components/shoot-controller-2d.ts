import { InputEnum } from "@nanoforge-dev/input";

/**
 * Fires bullets toward the mouse while a key is held. Needs `Position2D` and the
 * `shootControl2D` system.
 *
 * @remarks
 * Bullets start at the center of the entity's `HitboxRect2D` (or at its `Position2D`), hurt the
 * `Health` entities they hit, and are destroyed on hit.
 *
 * @component
 * @side client
 * @group Trigger color=#9d7bff - When it fires.
 * @group Bullet color=#e5484d - The bullets it fires.
 */
export class ShootController2D {
  name = "ShootController2D";

  /** Seconds left before it can fire again. */
  reloadTimer = 0;

  constructor(
    /** The key (or mouse button) to hold. @group Trigger */
    public key: InputEnum = InputEnum.MouseLeft,
    /** Seconds between two bullets. @group Trigger */
    public reloadTime = 0.3,
    /** Hit points a bullet removes. @group Bullet */
    public damage = 10,
    /** In pixels per second. @group Bullet */
    public speed = 600,
    /** Radius of a bullet, in pixels. @group Bullet */
    public size = 5,
    /** A CSS color. @group Bullet @preset color */
    public color = "#cccccc",
  ) {}
}
