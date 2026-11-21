import { Acceleration3D } from "@nanoforge/basics-3d/components/acceleration-3d";
import { Position3D } from "@nanoforge/basics-3d/components/position-3d";
import { Rotation3D } from "@nanoforge/basics-3d/components/rotation-3d";
import { Scale3D } from "@nanoforge/basics-3d/components/scale-3d";
import { Velocity3D } from "@nanoforge/basics-3d/components/velocity-3d";
import { move3D } from "@nanoforge/basics-3d/systems/move-3d";
import { describe, expect, it } from "vitest";

import { frame, registry, run, spawn, useEcs } from "./helpers";

useEcs();

describe("basics-3d", () => {
  it("defaults to the origin, no rotation and a scale of 1", () => {
    expect(new Position3D()).toMatchObject({ x: 0, y: 0, z: 0 });
    expect(new Rotation3D()).toMatchObject({ x: 0, y: 0, z: 0 });
    expect(new Scale3D()).toMatchObject({ x: 1, y: 1, z: 1 });
    expect(new Velocity3D()).toMatchObject({ x: 0, y: 0, z: 0 });
    expect(new Acceleration3D()).toMatchObject({ x: 0, y: 0, z: 0 });
  });

  it("keeps the values given, and is found by a query", () => {
    spawn(new Position3D(1, -2, 3), new Rotation3D(90, 180, -45), new Scale3D(2, 0.5, 4));

    const found: { Position3D: Position3D; Rotation3D: Rotation3D; Scale3D: Scale3D }[] = [];
    registry.getZipper([Position3D, Rotation3D, Scale3D]).forEach((entity) => found.push(entity));

    expect(found).toHaveLength(1);
    expect(found[0]?.Position3D).toMatchObject({ x: 1, y: -2, z: 3 });
    expect(found[0]?.Rotation3D).toMatchObject({ x: 90, y: 180, z: -45 });
    expect(found[0]?.Scale3D).toMatchObject({ x: 2, y: 0.5, z: 4 });
  });

  it("move3D moves by velocity, and accelerates first", () => {
    const position = new Position3D(-2, 1, 4);
    const velocity = new Velocity3D(50, -70, 20);
    spawn(position, velocity, new Acceleration3D(10, 0, -40));
    registry.addSystem(move3D);

    run(frame(500));

    expect(velocity).toMatchObject({ x: 55, y: -70, z: 0 });
    expect(position).toMatchObject({ x: 25.5, y: -34, z: 4 });
  });
});
