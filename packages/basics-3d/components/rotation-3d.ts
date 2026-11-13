/**
 * How an entity is turned in the 3D world, in degrees around each axis.
 *
 * @remarks
 * Degrees, not radians. Plain numbers, without Three.js: server and shared code can use it.
 *
 * @example
 * `new Rotation3D(0, 90, 0)` turns an entity a quarter turn around the vertical axis.
 *
 * @component
 * @side shared
 * @group Rotation color=#b07aff - Degrees around each axis.
 */
export class Rotation3D {
  name = "Rotation3D";

  constructor(
    /** Degrees around the x axis. @group Rotation @preset vector.x */
    public x = 0,
    /** Degrees around the y axis (up). @group Rotation @preset vector.y */
    public y = 0,
    /** Degrees around the z axis. @group Rotation @preset vector.z */
    public z = 0,
  ) {}
}
