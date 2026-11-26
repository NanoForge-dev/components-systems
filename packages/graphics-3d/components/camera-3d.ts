import "@nanoforge-dev/graphics-3d/three";

/**
 * The point of view the game is shown from. Add `draw3D`; place it with `Position3D` and turn it
 * with `Rotation3D` (basics-3d).
 *
 * @remarks
 * It looks along -z, from `(0, 0, 5)` until it has a `Position3D`. The first active camera is the
 * one shown; with none, the library's default camera is shown: at `(0, 0, 5)`, looking at the
 * origin.
 *
 * @component
 * @side client
 * @group Camera color=#54a0ff - What the camera sees.
 * @group Advanced hidden - What is too near or too far to be shown.
 */
export class Camera3D {
  name = "Camera3D";

  constructor(
    /** Vertical field of view, in degrees. @group Camera */
    public fov = 50,
    /** Units from the camera under which nothing is shown. @group Advanced */
    public near = 0.1,
    /** Units from the camera past which nothing is shown. @group Advanced */
    public far = 1000,
    /** Show the game from this camera. @group Camera */
    public active = true,
  ) {}
}
