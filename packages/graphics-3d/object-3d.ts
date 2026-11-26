import {
  AmbientLight,
  BoxGeometry,
  type BufferGeometry,
  type Color,
  DirectionalLight,
  DoubleSide,
  Light,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  SphereGeometry,
  Texture,
} from "@nanoforge-dev/graphics-3d/three";

import type { Box3D } from "./components/box-3d";
import type { Camera3D } from "./components/camera-3d";
import type { Light3D } from "./components/light-3d";
import type { Object3DComponent } from "./components/object-3d-component";
import type { Plane3D } from "./components/plane-3d";
import type { Sphere3D } from "./components/sphere-3d";

type Params<C, N extends string> = Omit<C, "name"> & { name: N };
type ShapeParams =
  Params<Box3D, "Box3D"> | Params<Sphere3D, "Sphere3D"> | Params<Plane3D, "Plane3D">;

/**
 * The params of a graphics-3d component, told apart by `name`: a component, or a plain object with
 * the same fields (`{ name: "Box3D", width: 2, height: 1, depth: 1, color: "red" }`).
 */
export type Params3D =
  | ShapeParams
  | Params<Light3D, "Light3D">
  | Params<Camera3D, "Camera3D">
  | Params<Object3DComponent, "Object3DComponent">;

/** A point or a vector on three axes, like `Position3D`. */
export interface Xyz {
  x: number;
  y: number;
  z: number;
}

/**
 * The Three.js object for a component's params: `draw3D` and the editor's 3D Scene screen both use
 * it, so they show the same thing.
 *
 * @remarks
 * Uses only Three.js, no ECS and no `ctx`. Pass the object it returned last time as `previous`: it
 * comes back updated when it can be, and a new object when it can't (a light whose `kind` changed).
 * The caller then removes and disposes the previous one ({@link disposeObject3D}).
 */
export const toObject3D = (params: Params3D, previous?: Object3D): Object3D => {
  switch (params.name) {
    case "Box3D":
    case "Sphere3D":
    case "Plane3D":
      return meshFor(params, previous);
    case "Light3D":
      return lightFor(params, previous);
    case "Camera3D":
      return cameraFor(params, previous);
    case "Object3DComponent":
      return params.object;
  }
};

/** Places an object: rotation in degrees, as in `Rotation3D`. Leaves out what isn't given. */
export const applyTransform3D = (object: Object3D, position?: Xyz, rotation?: Xyz, scale?: Xyz) => {
  if (position) object.position.set(position.x, position.y, position.z);
  if (rotation)
    object.rotation.set(
      MathUtils.degToRad(rotation.x),
      MathUtils.degToRad(rotation.y),
      MathUtils.degToRad(rotation.z),
    );
  if (scale) object.scale.set(scale.x, scale.y, scale.z);
};

/** Removes an object from its parent and frees the GPU memory of its geometries, materials and textures. */
export const disposeObject3D = (object: Object3D) => {
  object.removeFromParent();
  object.traverse((child) => {
    const { geometry, material } = child as Object3D & {
      geometry?: BufferGeometry;
      material?: object | object[];
    };
    geometry?.dispose();
    for (const item of [material ?? []].flat()) {
      for (const value of Object.values(item)) if (value instanceof Texture) value.dispose();
      (item as { dispose?(): void }).dispose?.();
    }
    (child as { dispose?(): void }).dispose?.();
  });
};

/** Sets a color only when its CSS string changed: parsing it every frame is wasted work. */
const paint = (object: Object3D, color: Color, value: string) => {
  if (object.userData.color === value) return;
  color.set(value);
  object.userData.color = value;
};

const geometryFor = (params: ShapeParams) => {
  switch (params.name) {
    case "Box3D":
      return new BoxGeometry(params.width, params.height, params.depth);
    case "Sphere3D":
      return new SphereGeometry(params.radius, 32, 16);
    case "Plane3D":
      return new PlaneGeometry(params.width, params.height);
  }
};

const meshFor = (params: ShapeParams, previous?: Object3D) => {
  const mesh =
    previous instanceof Mesh
      ? (previous as Mesh<BufferGeometry, MeshStandardMaterial>)
      : new Mesh(undefined, new MeshStandardMaterial());
  // The geometry is rebuilt only when a size changed.
  const size =
    params.name === "Sphere3D"
      ? [params.radius]
      : [params.width, params.height, params.name === "Box3D" ? params.depth : 0];
  const shape = `${params.name}:${size.join()}`;
  if (mesh.userData.shape !== shape) {
    mesh.geometry.dispose();
    mesh.geometry = geometryFor(params);
    mesh.userData.shape = shape;
  }
  if (params.name === "Plane3D") mesh.material.side = DoubleSide;
  paint(mesh, mesh.material.color, params.color);
  return mesh;
};

const LIGHTS = {
  ambient: () => new AmbientLight(),
  directional: () => {
    const light = new DirectionalLight();
    light.position.set(5, 10, 7);
    return light;
  },
  point: () => new PointLight(),
};

const lightFor = (params: Params<Light3D, "Light3D">, previous?: Object3D) => {
  const light =
    previous instanceof Light && previous.userData.kind === params.kind
      ? previous
      : LIGHTS[params.kind]();
  light.userData.kind = params.kind;
  paint(light, light.color, params.color);
  light.intensity = params.intensity;
  return light;
};

const cameraFor = (params: Params<Camera3D, "Camera3D">, previous?: Object3D) => {
  let camera = previous as PerspectiveCamera;
  if (!(previous instanceof PerspectiveCamera)) {
    camera = new PerspectiveCamera();
    camera.position.set(0, 0, 5);
  }
  if (camera.fov !== params.fov || camera.near !== params.near || camera.far !== params.far) {
    camera.fov = params.fov;
    camera.near = params.near;
    camera.far = params.far;
    camera.updateProjectionMatrix();
  }
  return camera;
};
