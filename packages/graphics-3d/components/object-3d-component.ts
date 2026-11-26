import { Object3D } from "@nanoforge-dev/graphics-3d/three";

/**
 * Shows any Three.js object you built: a mesh with your own geometry or material, a group, an
 * `InstancedMesh` for many identical objects. Add `draw3D`; `Position3D`, `Rotation3D` and `Scale3D`
 * (basics-3d) move it like the shapes.
 *
 * @remarks
 * Removing the component, or the entity, removes the object and disposes its geometries,
 * materials and textures.
 *
 * @example
 * `new Object3DComponent(new Mesh(new TorusGeometry(), new MeshStandardMaterial()))`, with the
 * classes from `@nanoforge-dev/graphics-3d/three`.
 *
 * @component
 * @side client
 * @group Object color=#a29bfe - The Three.js object.
 */
export class Object3DComponent {
  name = "Object3DComponent";

  constructor(
    /** The object to show. @group Object */
    public object = new Object3D(),
  ) {}
}
