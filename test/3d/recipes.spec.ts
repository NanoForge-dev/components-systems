import type { Context } from "@nanoforge-dev/common";
import { Mesh, PerspectiveCamera, Scene } from "@nanoforge-dev/graphics-3d/three";
import { Position3D } from "@nanoforge/basics-3d/components/position-3d";
import { Velocity3D } from "@nanoforge/basics-3d/components/velocity-3d";
import { move3D } from "@nanoforge/basics-3d/systems/move-3d";
import { Box3D } from "@nanoforge/graphics-3d/components/box-3d";
import { Camera3D } from "@nanoforge/graphics-3d/components/camera-3d";
import { Light3D } from "@nanoforge/graphics-3d/components/light-3d";
import { Sphere3D } from "@nanoforge/graphics-3d/components/sphere-3d";
import { draw3D } from "@nanoforge/graphics-3d/systems/draw-3d";
import { describe, expect, it } from "vitest";

import { registry, runOn, spawn, useRegistry } from "../ecs";

/*
 * The 3D recipes of the packages' READMEs, end to end, apart from `../recipes.spec.ts`: these
 * build with graphics-3d's typings (tsconfig.spec.3d.json), the 2D ones with graphics-2d's.
 */

useRegistry();

describe("recipes: 3D", () => {
  it("a cube, a ball, a light and a camera: the cube rises, lit by the sun, seen from the camera", () => {
    const graphics = { scene: new Scene(), camera: new PerspectiveCamera() };
    const ctx = { app: { delta: 1000 / 60 }, graphics } as unknown as Context;
    spawn(new Box3D(1, 1, 1, "#44aa88"), new Position3D(-1, 0, 0), new Velocity3D(0, 0.5, 0));
    spawn(new Sphere3D(0.5, "#ff6b6b"), new Position3D(1, 0, 0));
    spawn(new Light3D("directional", "#ffffff", 3), new Position3D(3, 5, 4));
    spawn(new Camera3D(), new Position3D(0, 1, 6));
    registry.addSystem(move3D);
    registry.addSystem(draw3D);

    for (let i = 0; i < 60; i++) runOn(ctx);

    const [cube, ball, sun, camera] = graphics.scene.children;
    expect(graphics.scene.children).toHaveLength(4);
    expect(cube).toBeInstanceOf(Mesh);
    expect(cube?.position.y).toBeCloseTo(0.5);
    expect(ball?.position.x).toBe(1);
    expect(sun?.position.toArray()).toEqual([3, 5, 4]);
    expect(graphics.camera).toBe(camera);
    expect(camera?.position.toArray()).toEqual([0, 1, 6]);
  });
});
