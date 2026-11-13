import type { Context, InitContext } from "@nanoforge-dev/common";
import { EcsLibrary, type Registry } from "@nanoforge-dev/ecs/server";
import { InputEnum } from "@nanoforge-dev/input";
import { Acceleration2D } from "@nanoforge/basics-2d/components/acceleration-2d";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { Velocity2D } from "@nanoforge/basics-2d/components/velocity-2d";
import { move2D } from "@nanoforge/basics-2d/systems/move-2d";
import { Acceleration3D } from "@nanoforge/basics-3d/components/acceleration-3d";
import { Position3D } from "@nanoforge/basics-3d/components/position-3d";
import { Rotation3D } from "@nanoforge/basics-3d/components/rotation-3d";
import { Scale3D } from "@nanoforge/basics-3d/components/scale-3d";
import { Velocity3D } from "@nanoforge/basics-3d/components/velocity-3d";
import { move3D } from "@nanoforge/basics-3d/systems/move-3d";
import { DamageDealer } from "@nanoforge/combat-2d/components/damage-dealer";
import { DestroyOnHit2D } from "@nanoforge/combat-2d/components/destroy-on-hit-2d";
import { Health } from "@nanoforge/combat-2d/components/health";
import { Owner } from "@nanoforge/combat-2d/components/owner";
import { ShootController2D } from "@nanoforge/combat-2d/components/shoot-controller-2d";
import { applyDamage2D } from "@nanoforge/combat-2d/systems/apply-damage-2d";
import { destroyOnHit2D } from "@nanoforge/combat-2d/systems/destroy-on-hit-2d";
import { shootControl2D } from "@nanoforge/combat-2d/systems/shoot-control-2d";
import { JumpController2D } from "@nanoforge/controls-2d/components/jump-controller-2d";
import { MoveController2D } from "@nanoforge/controls-2d/components/move-controller-2d";
import { jumpControl2D } from "@nanoforge/controls-2d/systems/jump-control-2d";
import { moveControl2D } from "@nanoforge/controls-2d/systems/move-control-2d";
import { HitboxCircle2D } from "@nanoforge/physics-2d/components/hitbox-circle-2d";
import { HitboxRect2D } from "@nanoforge/physics-2d/components/hitbox-rect-2d";
import { RigidBody2D } from "@nanoforge/physics-2d/components/rigid-body-2d";
import { StaticBody2D } from "@nanoforge/physics-2d/components/static-body-2d";
import { applyGravity2D } from "@nanoforge/physics-2d/systems/apply-gravity-2d";
import { blockOnStaticBodies2D } from "@nanoforge/physics-2d/systems/block-on-static-bodies-2d";
import { detectCollisions2D } from "@nanoforge/physics-2d/systems/detect-collisions-2d";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

let registry: Registry;
let keys = new Set<InputEnum>();
let mouse = { x: 0, y: 0 };

/** A frame of `ms` milliseconds, with the keys of `keys` held. */
const frame = (ms = 1000): Context =>
  ({
    app: { delta: ms },
    input: {
      isKeyPressed: (key: InputEnum) => keys.has(key),
      getMousePosition: () => mouse,
    },
  }) as unknown as Context;

const spawn = (...components: { name: string }[]) => {
  const entity = registry.spawnEntity();
  for (const component of components) registry.addComponent(entity, component);
  return entity;
};

const run = (ctx = frame()) => registry.runSystems(ctx);

beforeAll(async () => {
  const ecs = new EcsLibrary();
  await ecs.__init({
    files: new Map([["/libecs.wasm", "./node_modules/@nanoforge-dev/ecs/dist/server/libecs.wasm"]]),
  } as unknown as InitContext);
  registry = ecs.registry;
});

beforeEach(() => {
  registry.clearSystems();
  registry.clearEntities();
  keys = new Set();
  mouse = { x: 0, y: 0 };
});

describe("basics-2d", () => {
  it("move2D moves by velocity, and accelerates first", () => {
    const position = new Position2D(-2, 1);
    const velocity = new Velocity2D(50, -70);
    spawn(position, velocity, new Acceleration2D(10, 0));
    registry.addSystem(move2D);

    run(frame(500));

    expect(velocity).toMatchObject({ x: 55, y: -70 });
    expect(position).toMatchObject({ x: 25.5, y: -34 });
  });
});

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

describe("physics-2d", () => {
  it("detectCollisions2D lists touching hitboxes of every shape", () => {
    const a = new HitboxRect2D(10, 10);
    const b = new HitboxRect2D(10, 10);
    const c = new HitboxCircle2D(5);
    const far = new HitboxCircle2D(5);
    const ea = spawn(new Position2D(0, 0), a);
    const eb = spawn(new Position2D(5, 5), b);
    const ec = spawn(new Position2D(19, 10), c);
    spawn(new Position2D(100, 100), far);
    registry.addSystem(detectCollisions2D);

    run();

    expect(a.collisions).toEqual([eb.getId()]);
    expect(b.collisions.sort()).toEqual([ea.getId(), ec.getId()].sort());
    expect(c.collisions).toEqual([eb.getId()]);
    expect(far.collisions).toEqual([]);
  });

  const world = () => {
    registry.addSystem(applyGravity2D);
    registry.addSystem(move2D);
    registry.addSystem(detectCollisions2D);
    registry.addSystem(blockOnStaticBodies2D);
  };

  it("a rigid body falls and stands on a static body", () => {
    const body = new RigidBody2D(1000);
    const position = new Position2D(0, 0);
    spawn(position, new Velocity2D(), new HitboxRect2D(10, 10), body);
    spawn(new Position2D(-50, 20), new HitboxRect2D(200, 10), new StaticBody2D());
    world();

    for (let i = 0; i < 60; i++) run(frame(16));

    expect(position.y).toBe(10);
    expect(body.grounded).toBe(true);
  });

  it("a rigid body walks over two floors side by side without being stopped", () => {
    const position = new Position2D(0, 10);
    const velocity = new Velocity2D(100, 0);
    spawn(position, velocity, new HitboxRect2D(10, 10), new RigidBody2D());
    spawn(new Position2D(0, 20), new HitboxRect2D(20, 10), new StaticBody2D());
    spawn(new Position2D(20, 20), new HitboxRect2D(20, 10), new StaticBody2D());
    world();

    for (let i = 0; i < 10; i++) run(frame(16));

    expect(position.x).toBeGreaterThan(15);
    expect(position.y).toBe(10);
  });

  it("a wall stops a rigid body", () => {
    const position = new Position2D(0, 0);
    const velocity = new Velocity2D(100, 0);
    spawn(position, velocity, new HitboxRect2D(10, 10), new RigidBody2D(0));
    spawn(new Position2D(12, -50), new HitboxRect2D(10, 100), new StaticBody2D());
    world();

    run(frame(100));

    expect(position.x).toBe(2);
    expect(velocity.x).toBe(0);
  });

  it("a ceiling stops a rigid body jumping into it", () => {
    const position = new Position2D(0, 25);
    const velocity = new Velocity2D(0, -100);
    const body = new RigidBody2D(0);
    spawn(position, velocity, new HitboxRect2D(10, 10), body);
    spawn(new Position2D(-50, 10), new HitboxRect2D(200, 10), new StaticBody2D());
    world();

    run(frame(100));

    expect(position.y).toBe(20);
    expect(velocity.y).toBe(0);
    expect(body.grounded).toBe(false);
  });

  it("a one-way platform lets a rigid body through from below", () => {
    const position = new Position2D(0, 25);
    const velocity = new Velocity2D(0, -100);
    spawn(position, velocity, new HitboxRect2D(10, 10), new RigidBody2D(0));
    spawn(new Position2D(-50, 20), new HitboxRect2D(200, 5), new StaticBody2D(true));
    world();

    run(frame(100));

    expect(position.y).toBe(15);
  });
});

describe("controls-2d", () => {
  it("moveControl2D sets the velocity from the held keys, on its axes only", () => {
    const velocity = new Velocity2D(0, 42);
    spawn(new MoveController2D(150, "horizontal"), velocity);
    registry.addSystem(moveControl2D);
    keys = new Set([InputEnum.ArrowLeft, InputEnum.ArrowUp]);

    run();

    expect(velocity).toMatchObject({ x: -150, y: 42 });
  });

  it("jumpControl2D jumps from the ground once per press", () => {
    const body = new RigidBody2D();
    body.grounded = true;
    const velocity = new Velocity2D();
    spawn(new JumpController2D(InputEnum.Space, 300), body, velocity);
    registry.addSystem(jumpControl2D);
    keys = new Set([InputEnum.Space]);

    run(frame(16));
    expect(velocity.y).toBe(-300);

    body.grounded = false;
    velocity.y = 0;
    run(frame(16));
    expect(velocity.y).toBe(0);
  });

  it("jumpControl2D still jumps with coyote time and buffering off", () => {
    const body = new RigidBody2D();
    body.grounded = true;
    const velocity = new Velocity2D();
    spawn(new JumpController2D(InputEnum.Space, 300, 1, 0, 0), body, velocity);
    registry.addSystem(jumpControl2D);
    keys = new Set([InputEnum.Space]);

    run(frame(16));

    expect(velocity.y).toBe(-300);
  });
});

describe("combat-2d", () => {
  it("applyDamage2D hurts once per contact and kills at 0", () => {
    const health = new Health(15);
    spawn(new Position2D(0, 0), new HitboxRect2D(10, 10), health);
    spawn(new Position2D(5, 5), new HitboxCircle2D(2), new DamageDealer(10));
    registry.addSystem(detectCollisions2D);
    registry.addSystem(applyDamage2D);

    run();
    run();
    expect(health.current).toBe(5);

    registry.clearEntities();
    const again = new Health(15);
    again.current = 5;
    const target = spawn(new Position2D(0, 0), new HitboxRect2D(10, 10), again);
    spawn(new Position2D(5, 5), new HitboxCircle2D(2), new DamageDealer(10));
    expect(registry.getComponents(Health).get(target.getId())).toBeDefined();
    run();
    expect(registry.getComponents(Health).get(target.getId())).toBeUndefined();
  });

  it("destroyOnHit2D ignores the owner, and static bodies when asked", () => {
    const owner = spawn(new Position2D(0, 0), new HitboxRect2D(10, 10));
    const wall = spawn(new Position2D(0, 0), new HitboxRect2D(10, 10), new StaticBody2D());
    const bullet = spawn(
      new Position2D(5, 5),
      new HitboxCircle2D(2),
      new DestroyOnHit2D(false),
      new Owner(owner.getId()),
    );
    registry.addSystem(detectCollisions2D);
    registry.addSystem(destroyOnHit2D);

    run();
    expect(registry.getComponents(DestroyOnHit2D).get(bullet.getId())).toBeDefined();

    registry.removeComponent(wall, StaticBody2D);
    run();
    expect(registry.getComponents(DestroyOnHit2D).get(bullet.getId())).toBeUndefined();
  });

  it("shootControl2D fires toward the mouse, then reloads", () => {
    const shooter = spawn(
      new Position2D(0, 0),
      new ShootController2D(InputEnum.MouseLeft, 1, 5, 100),
    );
    registry.addSystem(shootControl2D);
    keys = new Set([InputEnum.MouseLeft]);
    mouse = { x: 0, y: 50 };

    run(frame(16));
    run(frame(16));

    const bullets = registry.getIndexedZipper([Owner, Velocity2D, DamageDealer]);
    expect(bullets).toHaveLength(1);
    expect(bullets[0].Owner.entity).toBe(shooter.getId());
    expect(bullets[0].Velocity2D).toMatchObject({ x: 0, y: 100 });
    expect(bullets[0].DamageDealer.damage).toBe(5);
  });
});
