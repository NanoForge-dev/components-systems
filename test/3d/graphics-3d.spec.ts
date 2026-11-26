import type { Context } from "@nanoforge-dev/common";
import {
  AmbientLight,
  type BoxGeometry,
  type Camera,
  DirectionalLight,
  Group,
  type Light,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  SphereGeometry,
  Texture,
  TorusGeometry,
} from "@nanoforge-dev/graphics-3d/three";
import { Position3D } from "@nanoforge/basics-3d/components/position-3d";
import { Rotation3D } from "@nanoforge/basics-3d/components/rotation-3d";
import { Scale3D } from "@nanoforge/basics-3d/components/scale-3d";
import { Box3D } from "@nanoforge/graphics-3d/components/box-3d";
import { Camera3D } from "@nanoforge/graphics-3d/components/camera-3d";
import { Light3D } from "@nanoforge/graphics-3d/components/light-3d";
import { Model3D } from "@nanoforge/graphics-3d/components/model-3d";
import { Object3DComponent } from "@nanoforge/graphics-3d/components/object-3d-component";
import { Plane3D } from "@nanoforge/graphics-3d/components/plane-3d";
import { Sphere3D } from "@nanoforge/graphics-3d/components/sphere-3d";
import { toObject3D } from "@nanoforge/graphics-3d/object-3d";
import { draw3D } from "@nanoforge/graphics-3d/systems/draw-3d";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { registry, runOn, spawn, useRegistry } from "../ecs";

/** `ctx.assets`: a blob URL per path, and no asset at a path starting with `/missing`. */
const assets = {
  getAsset: (path: string) => {
    if (path.startsWith("/missing")) throw new Error("not found");
    return { path: `blob:${path}` };
  },
};

const gltf = vi.hoisted(() => ({ loadAsync: vi.fn() }));
vi.mock("three/addons/loaders/GLTFLoader.js", () => ({
  GLTFLoader: class {
    loadAsync = gltf.loadAsync;
  },
}));

useRegistry();

/** The part of graphics-3d's `ctx.graphics` that `draw3D` uses: a real scene and camera. */
const graphics3D = () => {
  const graphics = { scene: new Scene(), camera: new PerspectiveCamera() as Camera };
  return { graphics, ctx: { app: { delta: 16 }, graphics, assets } as unknown as Context };
};

/** What `draw3D` added for its components, without the default light. */
const shown = (scene: Scene) => scene.children.filter((child) => !(child instanceof Group));

describe("graphics-3d", () => {
  it("shows each shape, light, camera and object, placed by Position3D, Rotation3D and Scale3D", () => {
    const { graphics, ctx } = graphics3D();
    const torus = new Mesh(new TorusGeometry(), new MeshStandardMaterial());
    spawn(new Box3D(2, 3, 4, "#ff0000"), new Position3D(1, 2, 3), new Rotation3D(90, 0, -180));
    spawn(new Sphere3D(0.75, "blue"), new Scale3D(2, 2, 2));
    spawn(new Plane3D(10, 6));
    spawn(new Light3D("point", "#ffffff", 20), new Position3D(0, 4, 0));
    spawn(new Camera3D(60));
    spawn(new Object3DComponent(torus), new Position3D(-5, 0, 0));
    registry.addSystem(draw3D);

    runOn(ctx);

    const [box, sphere, plane, light, camera, object] = shown(graphics.scene) as Mesh[];
    expect((box?.geometry as BoxGeometry).parameters).toMatchObject({
      width: 2,
      height: 3,
      depth: 4,
    });
    expect((box?.material as MeshStandardMaterial).color.getHexString()).toBe("ff0000");
    expect(box?.position.toArray()).toEqual([1, 2, 3]);
    expect(box?.rotation.x).toBeCloseTo(Math.PI / 2);
    expect(box?.rotation.z).toBeCloseTo(-Math.PI);
    expect(sphere?.geometry).toBeInstanceOf(SphereGeometry);
    expect(sphere?.scale.toArray()).toEqual([2, 2, 2]);
    expect(plane?.geometry).toBeInstanceOf(PlaneGeometry);
    expect(light).toBeInstanceOf(PointLight);
    expect((light as unknown as Light).intensity).toBe(20);
    expect(light?.position.y).toBe(4);
    expect(object).toBe(torus);
    expect(torus.position.x).toBe(-5);
    expect(graphics.camera).toBe(camera);
    expect((camera as unknown as PerspectiveCamera).fov).toBe(60);
  });

  it("follows the fields: a new size rebuilds the geometry, a new color repaints, a new kind replaces the light", () => {
    const { graphics, ctx } = graphics3D();
    const box = new Box3D();
    const light = new Light3D("directional");
    spawn(box);
    spawn(light);
    registry.addSystem(draw3D);
    runOn(ctx);
    const [mesh, sun] = shown(graphics.scene) as [Mesh, DirectionalLight];
    const oldGeometry = mesh.geometry;
    const disposeGeometry = vi.spyOn(oldGeometry, "dispose");
    const disposeSun = vi.spyOn(sun, "dispose");

    runOn(ctx);
    expect(mesh.geometry).toBe(oldGeometry);

    box.width = 5;
    box.color = "#00ff00";
    light.kind = "ambient";
    runOn(ctx);

    expect(shown(graphics.scene)[0]).toBe(mesh);
    expect(mesh.geometry).not.toBe(oldGeometry);
    expect((mesh.geometry as BoxGeometry).parameters).toMatchObject({ width: 5 });
    expect(disposeGeometry).toHaveBeenCalledOnce();
    expect((mesh.material as MeshStandardMaterial).color.getHexString()).toBe("00ff00");
    expect(shown(graphics.scene)[1]).toBeInstanceOf(AmbientLight);
    expect(sun.parent).toBeNull();
    expect(disposeSun).toHaveBeenCalledOnce();
  });

  it("removes and disposes the object of a killed entity or a removed component", () => {
    const { graphics, ctx } = graphics3D();
    const texture = new Texture();
    const material = new MeshStandardMaterial({ map: texture });
    const torus = new Mesh(new TorusGeometry(), material);
    const killed = spawn(new Box3D());
    const stripped = spawn(new Object3DComponent(torus));
    registry.addSystem(draw3D);
    runOn(ctx);
    const [box] = shown(graphics.scene) as [Mesh];
    const disposed = [
      vi.spyOn(box.geometry, "dispose"),
      vi.spyOn(box.material as MeshStandardMaterial, "dispose"),
      vi.spyOn(torus.geometry, "dispose"),
      vi.spyOn(material, "dispose"),
      vi.spyOn(texture, "dispose"),
    ];

    registry.killEntity(killed);
    registry.removeComponent(stripped, Object3DComponent);
    runOn(ctx);

    expect(shown(graphics.scene)).toEqual([]);
    for (const dispose of disposed) expect(dispose).toHaveBeenCalledOnce();
  });

  it("lights an unlit scene by default, until it has a light of its own", () => {
    const { graphics, ctx } = graphics3D();
    registry.addSystem(draw3D);
    runOn(ctx);

    const rig = graphics.scene.children.find((child) => child instanceof Group);
    expect(rig?.children.map((light) => light.type)).toEqual(["AmbientLight", "DirectionalLight"]);

    const lamp = spawn(new Light3D());
    runOn(ctx);
    expect(graphics.scene.children.some((child) => child instanceof Group)).toBe(false);

    registry.killEntity(lamp);
    runOn(ctx);
    expect(graphics.scene.children.some((child) => child instanceof Group)).toBe(true);
  });

  it("shows the first active camera, from (0, 0, 5) without a Position3D, and the library's one without any", () => {
    const { graphics, ctx } = graphics3D();
    const libraryCamera = graphics.camera;
    const off = new Camera3D(70, 0.1, 1000, false);
    const on = new Camera3D(40);
    spawn(off);
    const entity = spawn(on);
    registry.addSystem(draw3D);
    runOn(ctx);

    expect((graphics.camera as PerspectiveCamera).fov).toBe(40);
    expect(graphics.camera.position.toArray()).toEqual([0, 0, 5]);

    on.active = false;
    runOn(ctx);
    expect(graphics.camera).toBe(libraryCamera);

    on.active = true;
    runOn(ctx);
    registry.killEntity(entity);
    runOn(ctx);
    expect(graphics.camera).toBe(libraryCamera);
  });

  it("does nothing in an app without graphics-3d", () => {
    spawn(new Box3D());
    registry.addSystem(draw3D);

    expect(() => runOn({ app: { delta: 16 } } as unknown as Context)).not.toThrow();
  });

  it("toObject3D maps plain params, and updates the object it is given", () => {
    const box = toObject3D({ name: "Box3D", width: 2, height: 1, depth: 1, color: "red" }) as Mesh;
    const plane = toObject3D({ name: "Plane3D", width: 4, height: 4, color: "#888888" }) as Mesh;
    const sun = toObject3D({ name: "Light3D", kind: "directional", color: "white", intensity: 3 });
    const camera = toObject3D({ name: "Camera3D", fov: 75, near: 1, far: 50, active: true });

    expect((box.geometry as BoxGeometry).parameters).toMatchObject({ width: 2 });
    expect((plane.material as MeshStandardMaterial).side).toBe(2); // DoubleSide
    expect(sun).toBeInstanceOf(DirectionalLight);
    expect(sun.position.toArray()).toEqual([5, 10, 7]);
    expect(camera).toMatchObject({ fov: 75, near: 1, far: 50 });

    const same: Object3D = toObject3D(
      { name: "Box3D", width: 3, height: 1, depth: 1, color: "red" },
      box,
    );
    expect(same).toBe(box);
    expect(((same as Mesh).geometry as BoxGeometry).parameters).toMatchObject({ width: 3 });
  });

  describe("Model3D", () => {
    /** A loaded glTF scene: one mesh with a textured material, its disposes spied. */
    const model = () => {
      const geometry = new SphereGeometry();
      const map = new Texture();
      const material = new MeshStandardMaterial({ map });
      const scene = new Group().add(new Mesh(geometry, material));
      return { scene, spies: [geometry, material, map].map((it) => vi.spyOn(it, "dispose")) };
    };
    /** The groups draw3D made for Model3Ds (the default light is a group too). */
    const models = (scene: Scene) => scene.children.filter((child) => "path" in child.userData);
    /** Lets the pending loads end. */
    const settle = () => new Promise((resolve) => setTimeout(resolve));

    beforeEach(() => {
      gltf.loadAsync.mockReset();
    });

    it("shows the model once loaded, placed by the transform, without blocking the frame", async () => {
      const { graphics, ctx } = graphics3D();
      const { scene: loaded } = model();
      gltf.loadAsync.mockResolvedValue({ scene: loaded });
      spawn(new Model3D("/models/duck.glb"), new Position3D(1, 2, 3));
      registry.addSystem(draw3D);

      runOn(ctx);
      const [group] = models(graphics.scene);
      expect(group?.children).toHaveLength(0);

      await settle();
      expect(gltf.loadAsync).toHaveBeenCalledWith("blob:/models/duck.glb");
      expect(group?.children).toEqual([loaded]);
      expect(group?.position).toMatchObject({ x: 1, y: 2, z: 3 });
    });

    it("logs the path and shows a placeholder box for a missing or broken file", async () => {
      const { graphics, ctx } = graphics3D();
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      gltf.loadAsync.mockRejectedValue(new Error("bad glb"));
      spawn(new Model3D("/missing.glb"));
      spawn(new Model3D("/models/broken.glb"));
      registry.addSystem(draw3D);

      expect(() => runOn(ctx)).not.toThrow();
      await settle();

      const groups = models(graphics.scene);
      expect(groups).toHaveLength(2);
      for (const group of groups) expect(group.children[0]).toBeInstanceOf(Mesh);
      for (const path of ["/missing.glb", "/models/broken.glb"])
        expect(error).toHaveBeenCalledWith(expect.stringContaining(path), expect.anything());
      error.mockRestore();
    });

    it("disposes the model's geometries, materials and textures when removed", async () => {
      const { graphics, ctx } = graphics3D();
      const { scene: loaded, spies } = model();
      gltf.loadAsync.mockResolvedValue({ scene: loaded });
      const entity = spawn(new Model3D("/models/duck.glb"));
      registry.addSystem(draw3D);
      runOn(ctx);
      await settle();

      registry.killEntity(entity);
      runOn(ctx);

      expect(models(graphics.scene)).toHaveLength(0);
      for (const spy of spies) expect(spy).toHaveBeenCalled();
    });

    it("drops and disposes a load that ends after the component was removed", async () => {
      const { ctx } = graphics3D();
      const { scene: loaded, spies } = model();
      let finish = (_: unknown) => {};
      gltf.loadAsync.mockReturnValue(new Promise((resolve) => (finish = resolve)));
      const entity = spawn(new Model3D("/models/duck.glb"));
      registry.addSystem(draw3D);
      runOn(ctx);
      registry.killEntity(entity);
      runOn(ctx);

      finish({ scene: loaded });
      await settle();

      expect(loaded.parent).toBeNull();
      for (const spy of spies) expect(spy).toHaveBeenCalled();
    });

    it("loads the new file when the path changes", async () => {
      const { graphics, ctx } = graphics3D();
      gltf.loadAsync.mockReturnValue(new Promise(() => {}));
      const component = new Model3D("/models/duck.glb");
      spawn(component);
      registry.addSystem(draw3D);
      runOn(ctx);
      const [first] = models(graphics.scene);

      runOn(ctx);
      component.path = "/models/fox.glb";
      runOn(ctx);
      await settle();

      expect(models(graphics.scene)).not.toContain(first);
      expect(models(graphics.scene)).toHaveLength(1);
      expect(gltf.loadAsync).toHaveBeenCalledTimes(2);
      expect(gltf.loadAsync).toHaveBeenLastCalledWith("blob:/models/fox.glb");
    });
  });
});
