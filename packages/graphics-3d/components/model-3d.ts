import "@nanoforge-dev/graphics-3d/three";

/**
 * Shows a 3D model from a `.glb` or `.gltf` file. Needs the `draw3D` system.
 *
 * @remarks
 * The model loads in the background: the game starts at once and the model appears when it is
 * ready. A missing or broken file logs an error and shows a magenta box instead. Move, turn and
 * resize it with `Position3D`, `Rotation3D` and `Scale3D`.
 *
 * @example
 * `new Model3D("/models/duck.glb")` with a `Position3D`, and a `Light3D` to see its colors.
 *
 * @component
 * @side client
 * @group Model color=#ff8a3d - The model file.
 */
export class Model3D {
  name = "Model3D";

  constructor(
    /** The model file. @group Model @asset .glb .gltf */
    public path = "",
  ) {}
}
