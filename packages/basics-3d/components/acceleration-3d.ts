/**
 * How fast the velocity of an entity changes, in units per second, per second. Needs
 * `Velocity3D` and the `move3D` system.
 *
 * @component
 * @side shared
 * @group Acceleration color=#f0a33a - Units per second, per second.
 */
export class Acceleration3D {
  name = "Acceleration3D";

  constructor(
    /** Added to the x velocity every second. @group Acceleration @preset vector.x */
    public x = 0,
    /** Added to the y velocity every second. @group Acceleration @preset vector.y */
    public y = 0,
    /** Added to the z velocity every second. @group Acceleration @preset vector.z */
    public z = 0,
  ) {}
}
