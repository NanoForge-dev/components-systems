import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import {
  AmbientLight,
  type Camera,
  DirectionalLight,
  Group,
  type Object3D,
  type Scene,
} from "@nanoforge-dev/graphics-3d/three";
import { Position3D } from "@nanoforge/basics-3d/components/position-3d";
import { Rotation3D } from "@nanoforge/basics-3d/components/rotation-3d";
import { Scale3D } from "@nanoforge/basics-3d/components/scale-3d";

import { Box3D } from "../components/box-3d";
import { Camera3D } from "../components/camera-3d";
import { Light3D } from "../components/light-3d";
import { Object3DComponent } from "../components/object-3d-component";
import { Plane3D } from "../components/plane-3d";
import { Sphere3D } from "../components/sphere-3d";
import { type Params3D, applyTransform3D, disposeObject3D, toObject3D } from "../object-3d";

/**
 * The 3D library's `ctx.graphics`, as far as this system uses it. The library's main entry types
 * `Context.graphics` as the 3D API and graphics-2d as the 2D one, and every package here builds in
 * one program: so only `@nanoforge-dev/graphics-3d/three` is imported.
 */
interface Graphics3D {
  scene: Scene;
  camera: Camera;
}

/** What `draw3D` added to one app's scene. */
interface Shown {
  objects: Map<object, Object3D>;
  defaultCamera: Camera;
  defaultLight?: Object3D;
}

/** Per scene, not per module: a restart makes a new scene. */
const shownIn = new WeakMap<Scene, Shown>();

/** The components `draw3D` shows, by the key the ECS gives them in a zipper. */
const KINDS = { Box3D, Sphere3D, Plane3D, Light3D, Camera3D, Object3DComponent };

const defaultLight = () => {
  const sun = new DirectionalLight(0xffffff, 2.5);
  sun.position.set(5, 10, 7);
  return new Group().add(new AmbientLight(0xffffff, 0.5), sun);
};

/**
 * Shows the 3D components in the scene of `@nanoforge-dev/graphics-3d`: `Box3D`, `Sphere3D`,
 * `Plane3D`, `Light3D`, `Camera3D` and `Object3DComponent`, placed by `Position3D`, `Rotation3D`
 * and `Scale3D` (basics-3d). Add it after the systems that move entities.
 *
 * @remarks
 * Each component gets its Three.js object the first frame it is seen, which follows its fields
 * after that. A removed component, or a killed entity, loses its object, and its geometries,
 * materials and textures are disposed. The first active `Camera3D` is the one shown. Until the
 * scene has a light, it gets a default one (ambient and sun), so shapes are not black.
 *
 * @system
 * @side client
 * @uses graphics
 */
export const draw3D = (registry: Registry, ctx: Context) => {
  const graphics = (ctx as unknown as { graphics?: Partial<Graphics3D> }).graphics;
  if (!graphics?.scene || !graphics.camera) return;
  const { scene } = graphics;
  let shown = shownIn.get(scene);
  if (!shown) shownIn.set(scene, (shown = { objects: new Map(), defaultCamera: graphics.camera }));

  const positions = new Map<number, Position3D>(
    registry.getIndexedZipper([Position3D]).map(({ id, Position3D }) => [id, Position3D]),
  );
  const rotations = new Map<number, Rotation3D>(
    registry.getIndexedZipper([Rotation3D]).map(({ id, Rotation3D }) => [id, Rotation3D]),
  );
  const scales = new Map<number, Scale3D>(
    registry.getIndexedZipper([Scale3D]).map(({ id, Scale3D }) => [id, Scale3D]),
  );

  const objects = new Map<object, Object3D>();
  let camera: Object3D | undefined;
  for (const [key, Kind] of Object.entries(KINDS))
    registry
      .getIndexedZipper([Kind])
      .forEach((row: { id: number } & Record<string, Params3D | undefined>) => {
        const component = row[key];
        if (!component) return;
        const previous = shown.objects.get(component);
        const object = toObject3D(component, previous);
        if (object !== previous) {
          if (previous) disposeObject3D(previous);
          scene.add(object);
        }
        applyTransform3D(object, positions.get(row.id), rotations.get(row.id), scales.get(row.id));
        objects.set(component, object);
        if (component.name === "Camera3D" && component.active) camera ??= object;
      });

  // `killEntity` and `removeComponent` don't tell: an object whose component is gone goes here.
  for (const [component, object] of shown.objects)
    if (!objects.has(component)) disposeObject3D(object);
  shown.objects = objects;

  const next = (camera as Camera | undefined) ?? shown.defaultCamera;
  if (graphics.camera !== next) graphics.camera = next;

  // shortcut: only top-level lights count, not one inside an Object3DComponent's group; traverse if someone hits it.
  const lit = scene.children.some((child) => "isLight" in child);
  if (!lit && !shown.defaultLight) scene.add((shown.defaultLight = defaultLight()));
  if (lit && shown.defaultLight) {
    disposeObject3D(shown.defaultLight);
    shown.defaultLight = undefined;
  }
};
