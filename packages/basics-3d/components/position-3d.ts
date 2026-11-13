/**
 * Where an entity is in the 3D world, in units along each axis.
 *
 * @remarks
 * Plain numbers, without Three.js: server and shared code can use it.
 *
 * @component
 * @side shared
 * @group Position color=#4aa3ff - Units along each axis.
 */
export class Position3D {
  name = "Position3D";

  constructor(
    /** Units along the x axis. @group Position @preset vector.x */
    public x = 0,
    /** Units along the y axis (up). @group Position @preset vector.y */
    public y = 0,
    /** Units along the z axis. @group Position @preset vector.z */
    public z = 0,
  ) {}
}
