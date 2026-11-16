/**
 * How big an entity is in the 3D world, as a multiplier on each axis: 1 keeps its size.
 *
 * @remarks
 * Plain numbers, without Three.js: server and shared code can use it.
 *
 * @example
 * `new Scale3D(2, 1, 1)` makes an entity twice as wide.
 *
 * @component
 * @side shared
 * @group Scale color=#36c5a0 - Size multiplier on each axis.
 */
export class Scale3D {
  name = "Scale3D";

  constructor(
    /** Multiplier along the x axis. @group Scale @preset vector.x */
    public x = 1,
    /** Multiplier along the y axis (up). @group Scale @preset vector.y */
    public y = 1,
    /** Multiplier along the z axis. @group Scale @preset vector.z */
    public z = 1,
  ) {}
}
