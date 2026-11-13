/**
 * How fast an entity moves in the 3D world, in units per second. Needs `Position3D` and the
 * `move3D` system.
 *
 * @example
 * `new Velocity3D(0, 2, 0)` moves 2 units up every second.
 *
 * @component
 * @side shared
 * @group Velocity color=#36c5a0 - Units per second.
 */
export class Velocity3D {
  name = "Velocity3D";

  constructor(
    /** Units per second along the x axis. @group Velocity @preset vector.x */
    public x = 0,
    /** Units per second along the y axis (up). @group Velocity @preset vector.y */
    public y = 0,
    /** Units per second along the z axis. @group Velocity @preset vector.z */
    public z = 0,
  ) {}
}
