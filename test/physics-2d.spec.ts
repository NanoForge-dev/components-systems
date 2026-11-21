import type { Registry } from "@nanoforge-dev/ecs";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { Tag } from "@nanoforge/basics-2d/components/tag";
import { Velocity2D } from "@nanoforge/basics-2d/components/velocity-2d";
import { move2D } from "@nanoforge/basics-2d/systems/move-2d";
import { boxOf, centerOf, nearest } from "@nanoforge/physics-2d/collisions";
import { Bounds2D } from "@nanoforge/physics-2d/components/bounds-2d";
import { ChaseNearest2D } from "@nanoforge/physics-2d/components/chase-nearest-2d";
import { DeflectOnHit2D } from "@nanoforge/physics-2d/components/deflect-on-hit-2d";
import { HitboxCircle2D } from "@nanoforge/physics-2d/components/hitbox-circle-2d";
import { HitboxRect2D } from "@nanoforge/physics-2d/components/hitbox-rect-2d";
import { RigidBody2D } from "@nanoforge/physics-2d/components/rigid-body-2d";
import { StaticBody2D } from "@nanoforge/physics-2d/components/static-body-2d";
import { WalkAndJump2D } from "@nanoforge/physics-2d/components/walk-and-jump-2d";
import { applyGravity2D } from "@nanoforge/physics-2d/systems/apply-gravity-2d";
import { blockOnStaticBodies2D } from "@nanoforge/physics-2d/systems/block-on-static-bodies-2d";
import { chaseNearest2D } from "@nanoforge/physics-2d/systems/chase-nearest-2d";
import { deflectOnHit2D } from "@nanoforge/physics-2d/systems/deflect-on-hit-2d";
import { detectCollisions2D } from "@nanoforge/physics-2d/systems/detect-collisions-2d";
import { keepInBounds2D } from "@nanoforge/physics-2d/systems/keep-in-bounds-2d";
import { walkAndJump2D } from "@nanoforge/physics-2d/systems/walk-and-jump-2d";
import { describe, expect, it } from "vitest";

import { alive, frame, registry, run, spawn, useEcs } from "./helpers";

useEcs();

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

  it("a bouncing body goes back off a wall and a floor, by its bounce", () => {
    const ball = new Velocity2D(100, 0);
    const position = new Position2D(0, 0);
    spawn(position, ball, new HitboxRect2D(10, 10), new RigidBody2D(0, 1));
    spawn(new Position2D(12, -50), new HitboxRect2D(10, 100), new StaticBody2D());
    const soft = new Velocity2D(0, 100);
    spawn(new Position2D(100, 0), soft, new HitboxRect2D(10, 10), new RigidBody2D(0, 0.5));
    spawn(new Position2D(50, 15), new HitboxRect2D(100, 10), new StaticBody2D());
    world();

    run(frame(100));

    expect(position.x).toBe(2);
    expect(ball.x).toBe(-100);
    expect(soft.y).toBe(-50);
  });

  it("a HitboxCircle2D ball bounces off a wall as its bounding square", () => {
    const position = new Position2D(0, 0);
    const velocity = new Velocity2D(100, 0);
    spawn(position, velocity, new HitboxCircle2D(5), new RigidBody2D(0, 1));
    spawn(new Position2D(12, -50), new HitboxRect2D(10, 100), new StaticBody2D());
    world();

    run(frame(100));

    expect(position.x).toBe(7);
    expect(velocity.x).toBe(-100);
  });

  it("a HitboxCircle2D lands on a floor", () => {
    const body = new RigidBody2D(1000);
    const position = new Position2D(0, 0);
    spawn(position, new Velocity2D(), new HitboxCircle2D(5), body);
    spawn(new Position2D(-50, 20), new HitboxRect2D(200, 10), new StaticBody2D());
    world();

    for (let i = 0; i < 60; i++) run(frame(16));

    expect(position.y).toBeCloseTo(15);
    expect(body.grounded).toBe(true);
  });

  it("an offset hitbox lands with its box, on an offset floor", () => {
    const body = new RigidBody2D(1000);
    const position = new Position2D(0, 0);
    spawn(position, new Velocity2D(), new HitboxRect2D(10, 10, 5, 8), body);
    spawn(new Position2D(-50, 25), new HitboxRect2D(200, 10, 0, 5), new StaticBody2D());
    world();

    for (let i = 0; i < 60; i++) run(frame(16));

    expect(position.y).toBeCloseTo(12);
    expect(body.grounded).toBe(true);
  });

  it("a wall stops a WalkAndJump2D without a RigidBody2D, which still walks along it", () => {
    const position = new Position2D(0, 0);
    const walker = Object.assign(new WalkAndJump2D(100), { moveX: 1 });
    spawn(position, new Velocity2D(), new HitboxRect2D(10, 10), walker);
    spawn(new Position2D(12, -50), new HitboxRect2D(10, 100), new StaticBody2D());
    registry.addSystem(walkAndJump2D);
    registry.addSystem(move2D);
    registry.addSystem(detectCollisions2D);
    registry.addSystem(blockOnStaticBodies2D);

    for (let i = 0; i < 10; i++) run(frame(16));
    expect(position).toMatchObject({ x: 2, y: 0 });

    walker.moveY = 1;
    for (let i = 0; i < 10; i++) run(frame(16));
    expect(position.x).toBe(2);
    expect(position.y).toBeCloseTo((10 * 1.6) / Math.SQRT2);
  });

  it("keepInBounds2D clamps, wraps or removes an entity at the edge of its area", () => {
    const clamped = new Position2D(95, -5);
    const velocity = new Velocity2D(30, -30);
    spawn(clamped, velocity, new HitboxRect2D(10, 10), new Bounds2D(0, 0, 100, 100));
    const wrapped = new Position2D(-12, 50);
    spawn(wrapped, new HitboxCircle2D(10), new Bounds2D(0, 0, 100, 100, "wrap"));
    const inside = new Position2D(50, 50);
    spawn(inside, new Bounds2D(0, 0, 100, 100, "destroy"));
    const gone = spawn(new Position2D(150, 50), new Bounds2D(0, 0, 100, 100, "destroy"));
    registry.addSystem(keepInBounds2D);

    run();

    expect(clamped).toMatchObject({ x: 90, y: 0 });
    expect(velocity).toMatchObject({ x: 0, y: 0 });
    expect(wrapped).toMatchObject({ x: 110, y: 50 });
    expect(inside).toMatchObject({ x: 50, y: 50 });
    expect(alive(Bounds2D, gone)).toBe(false);
  });

  it("keepInBounds2D keeps an offset hitbox inside by its box", () => {
    const position = new Position2D(95, 0);
    const velocity = new Velocity2D(30, 0);
    spawn(position, velocity, new HitboxRect2D(10, 10, 20, 5), new Bounds2D(0, 0, 100, 100));
    registry.addSystem(keepInBounds2D);

    run();

    expect(position).toMatchObject({ x: 70, y: 0 });
    expect(velocity.x).toBe(0);
  });

  it("detectCollisions2D moves each hitbox by its offset", () => {
    const box = new HitboxRect2D(10, 10, 20, 0);
    const round = new HitboxCircle2D(5, 0, 30);
    const unmoved = new HitboxRect2D(10, 10);
    spawn(new Position2D(0, 0), box);
    spawn(new Position2D(0, 0), round);
    spawn(new Position2D(0, 0), unmoved);
    const right = spawn(new Position2D(25, 0), new HitboxRect2D(10, 10));
    const below = spawn(new Position2D(-5, 28), new HitboxRect2D(10, 4));
    registry.addSystem(detectCollisions2D);

    run();

    expect(box.collisions).toEqual([right.getId()]);
    expect(round.collisions).toEqual([below.getId()]);
    expect(unmoved.collisions).toEqual([]);
  });

  it("boxOf and centerOf read a hitbox with its offset, and nearest picks the closest in range", () => {
    const rect = spawn(new HitboxRect2D(10, 20, 5, 6));
    const circle = spawn(new HitboxCircle2D(4, 10, 3));
    const none = spawn();
    const at = { x: 100, y: 200 };

    expect(boxOf(registry, rect, at)).toEqual({ x: 105, y: 206, width: 10, height: 20 });
    expect(boxOf(registry, circle, at)).toEqual({ x: 106, y: 199, width: 8, height: 8 });
    expect(boxOf(registry, none, at)).toBeUndefined();
    expect(centerOf(registry, rect, at)).toEqual({ x: 110, y: 216 });
    expect(centerOf(registry, circle, at)).toEqual({ x: 110, y: 203 });
    expect(centerOf(registry, none, at)).toEqual(at);

    const candidates = [
      { id: 1, x: 30, y: 0 },
      { id: 2, x: 0, y: 10 },
      { id: 3, x: 0, y: -10 },
    ];
    expect(nearest({ x: 0, y: 0 }, candidates, 0)?.id).toBe(2);
    expect(nearest({ x: 0, y: 0 }, candidates, 10)?.id).toBe(2);
    expect(nearest({ x: 0, y: 0 }, candidates, 5)).toBeUndefined();
    expect(nearest({ x: 0, y: 0 }, [], 0)).toBeUndefined();
  });

  it("WalkAndJump2D takes its settings in order, and starts at rest", () => {
    expect(new WalkAndJump2D(1000, "vertical", 64, 2, 0, 0.2)).toMatchObject({
      speed: 1000,
      axes: "vertical",
      jumpHeight: 64,
      maxJumps: 2,
      coyoteTime: 0,
      bufferTime: 0.2,
    });
    expect(new WalkAndJump2D()).toMatchObject({
      speed: 200,
      axes: "both",
      jumpHeight: 128,
      maxJumps: 1,
      coyoteTime: 0.1,
      bufferTime: 0.1,
      moveX: 0,
      moveY: 0,
      jumpRequested: false,
      jumpsLeft: 0,
      coyoteTimer: 0,
      bufferTimer: 0,
    });
  });

  it("walkAndJump2D walks at its speed on its axes, a diagonal capped at it", () => {
    const diagonal = new Velocity2D();
    spawn(Object.assign(new WalkAndJump2D(100), { moveX: 1, moveY: 1 }), diagonal);
    const half = new Velocity2D(0, 42);
    spawn(Object.assign(new WalkAndJump2D(100), { moveX: 0.5 }), half);
    const paddle = new Velocity2D(42, 0);
    spawn(Object.assign(new WalkAndJump2D(100, "vertical"), { moveX: 1, moveY: -1 }), paddle);
    const pushed = new Velocity2D(0, 42);
    spawn(Object.assign(new WalkAndJump2D(100, "horizontal"), { moveX: 3, moveY: 1 }), pushed);
    registry.addSystem(walkAndJump2D);

    run(frame(16));

    expect(diagonal.x).toBeCloseTo(100 / Math.SQRT2);
    expect(diagonal.y).toBeCloseTo(100 / Math.SQRT2);
    expect(half).toMatchObject({ x: 50, y: 0 });
    expect(paddle).toMatchObject({ x: 42, y: -100 });
    expect(pushed).toMatchObject({ x: 100, y: 42 });
  });

  it("walkAndJump2D leaves the vertical velocity to gravity under a RigidBody2D", () => {
    const velocity = new Velocity2D();
    const walker = Object.assign(new WalkAndJump2D(), { moveX: -1, moveY: -1 });
    spawn(walker, new RigidBody2D(), velocity);
    registry.addSystem(walkAndJump2D);
    registry.addSystem(applyGravity2D);

    run(frame(100));

    expect(velocity.x).toBe(-200);
    expect(velocity.y).toBeCloseTo(98);
  });

  it("walkAndJump2D counts a move that isn't a finite number as 0", () => {
    const walker = Object.assign(new WalkAndJump2D(), { moveY: NaN });
    Reflect.set(walker, "moveX", "1");
    const position = new Position2D(10, 10);
    const velocity = new Velocity2D(5, 5);
    spawn(position, velocity, walker);
    registry.addSystem(walkAndJump2D);
    registry.addSystem(move2D);

    run();

    expect(velocity).toMatchObject({ x: 0, y: 0 });
    expect(position).toMatchObject({ x: 10, y: 10 });
  });

  it("walkAndJump2D jumps from the ground once per request, and clears it", () => {
    const body = new RigidBody2D(1000);
    body.grounded = true;
    const velocity = new Velocity2D();
    const walker = Object.assign(new WalkAndJump2D(200, "both", 45), { jumpRequested: true });
    spawn(walker, body, velocity);
    registry.addSystem(walkAndJump2D);

    run(frame(16));
    expect(velocity.y).toBe(-300);
    expect(walker.jumpRequested).toBe(false);

    body.grounded = false;
    velocity.y = 0;
    run(frame(16));
    expect(velocity.y).toBe(0);
  });

  it("walkAndJump2D still jumps with coyote time and buffering off", () => {
    const body = new RigidBody2D(1000);
    body.grounded = true;
    const velocity = new Velocity2D();
    const walker = new WalkAndJump2D(200, "both", 45, 1, 0, 0);
    spawn(Object.assign(walker, { jumpRequested: true }), body, velocity);
    registry.addSystem(walkAndJump2D);

    run(frame(16));

    expect(velocity.y).toBe(-300);
  });

  it("walkAndJump2D jumps jumpHeight pixels under gravity, and never without a RigidBody2D", () => {
    const body = new RigidBody2D();
    body.grounded = true;
    const jumper = new Velocity2D();
    spawn(Object.assign(new WalkAndJump2D(), { jumpRequested: true }), body, jumper);
    const topDown = Object.assign(new WalkAndJump2D(), { jumpRequested: true });
    const still = new Velocity2D();
    spawn(topDown, still);
    registry.addSystem(walkAndJump2D);

    run(frame(16));

    expect(jumper.y).toBeCloseTo(-Math.sqrt(2 * 980 * 128));
    expect(jumper.y).toBeCloseTo(-501, 0);
    expect(still.y).toBe(0);
    expect(topDown.jumpRequested).toBe(false);
  });

  it("walkAndJump2D keeps a jump asked for in the air for bufferTime seconds", () => {
    const body = new RigidBody2D(1000);
    const velocity = new Velocity2D();
    const walker = Object.assign(new WalkAndJump2D(200, "both", 45), { jumpRequested: true });
    spawn(walker, body, velocity);
    registry.addSystem(walkAndJump2D);

    run(frame(50));
    expect(velocity.y).toBe(0);
    expect(walker.jumpRequested).toBe(false);
    body.grounded = true;
    run(frame(16));
    expect(velocity.y).toBe(-300);

    body.grounded = false;
    velocity.y = 0;
    walker.jumpRequested = true;
    run(frame(16));
    run(frame(200));
    body.grounded = true;
    run(frame(16));
    expect(velocity.y).toBe(0);
  });

  it("walkAndJump2D jumps for coyoteTime seconds after walking off a ledge", () => {
    const body = new RigidBody2D(1000);
    body.grounded = true;
    const velocity = new Velocity2D();
    const walker = new WalkAndJump2D(200, "both", 45);
    spawn(walker, body, velocity);
    registry.addSystem(walkAndJump2D);

    run(frame(16));
    body.grounded = false;
    run(frame(50));
    walker.jumpRequested = true;
    run(frame(16));
    expect(velocity.y).toBe(-300);

    body.grounded = true;
    run(frame(16));
    body.grounded = false;
    velocity.y = 0;
    run(frame(150));
    walker.jumpRequested = true;
    run(frame(16));
    expect(velocity.y).toBe(0);
  });

  it("chaseNearest2D walks toward the nearest other entity with the tag, between hitbox middles", () => {
    const position = new Position2D(0, 0);
    const chaser = new WalkAndJump2D(100);
    const self = new Tag("player");
    spawn(position, new Velocity2D(), new HitboxRect2D(10, 10), self, chaser, new ChaseNearest2D());
    spawn(new Position2D(30, 40), new HitboxRect2D(10, 10), new Tag("enemy player"));
    spawn(new Position2D(-100, 0), new Tag("player"));
    spawn(new Position2D(10, 10), new Tag("enemy"));
    registry.addSystem(chaseNearest2D);
    registry.addSystem(walkAndJump2D);
    registry.addSystem(move2D);

    run(frame(100));

    expect(chaser.moveX).toBeCloseTo(0.6);
    expect(chaser.moveY).toBeCloseTo(0.8);
    expect(position.x).toBeCloseTo(6);
    expect(position.y).toBeCloseTo(8);
  });

  it("chaseNearest2D goes full speed on the axes its walker walks: a jump doesn't slow it", () => {
    // Under gravity it walks left and right only: a player up and to the right doesn't slow it.
    const platformer = new WalkAndJump2D(100);
    const velocity = new Velocity2D();
    spawn(new Position2D(0, 0), velocity, new RigidBody2D(), platformer, new ChaseNearest2D());
    // A vertical walker goes up or down only.
    const lift = new WalkAndJump2D(100, "vertical");
    spawn(new Position2D(0, 500), new Velocity2D(), lift, new ChaseNearest2D());
    spawn(new Position2D(30, -40), new Tag("player"));
    registry.addSystem(chaseNearest2D);
    registry.addSystem(walkAndJump2D);

    run();

    expect(platformer).toMatchObject({ moveX: 1, moveY: 0 });
    expect(velocity.x).toBe(100);
    expect(lift).toMatchObject({ moveX: 0, moveY: -1 });
  });

  it("chaseNearest2D stops out of range, and once the target is gone", () => {
    const chase = new ChaseNearest2D("player", 100);
    const chaser = new WalkAndJump2D();
    spawn(new Position2D(0, 0), chaser, chase);
    const target = new Position2D(50, 0);
    const player = spawn(target, new Tag("player"));
    registry.addSystem(chaseNearest2D);

    run();
    expect(chaser).toMatchObject({ moveX: 1, moveY: 0 });

    target.x = 150;
    run();
    expect(chaser).toMatchObject({ moveX: 0, moveY: 0 });

    chase.range = 0;
    run();
    expect(chaser).toMatchObject({ moveX: 1, moveY: 0 });

    registry.killEntity(player);
    run();
    expect(chaser).toMatchObject({ moveX: 0, moveY: 0 });
  });

  it("deflectOnHit2D sends a body back, at an angle where it hits an end", () => {
    const ballBody = (bounce = 1) => Object.assign(new RigidBody2D(), { gravity: 0, bounce });
    spawn(new Position2D(0, 0), new HitboxRect2D(10, 100), new DeflectOnHit2D("right", 45, 2, 150));
    const middle = new Velocity2D(-100, 0);
    const middlePosition = new Position2D(5, 45);
    spawn(middlePosition, middle, new HitboxRect2D(10, 10), ballBody());
    const end = new Velocity2D(-100, 0);
    spawn(new Position2D(5, 90), end, new HitboxRect2D(10, 10), ballBody());
    const dull = new Velocity2D(-100, 0);
    spawn(new Position2D(5, 20), dull, new HitboxRect2D(10, 10), ballBody(0));
    registry.addSystem(detectCollisions2D);
    registry.addSystem(deflectOnHit2D);

    run();

    expect(middle.x).toBeCloseTo(150);
    expect(middle.y).toBeCloseTo(0);
    expect(middlePosition.x).toBe(10);
    expect(end.y).toBeGreaterThan(0);
    expect(Math.hypot(end.x, end.y)).toBeCloseTo(150);
    expect(dull).toMatchObject({ x: -100, y: 0 });
  });

  it("deflectOnHit2D deflects a HitboxCircle2D ball, offsets included, by the box centers", () => {
    // A breakout paddle whose hitbox starts 10 pixels below its position: its face is at y 500.
    spawn(new Position2D(100, 490), new HitboxRect2D(100, 20, 0, 10), new DeflectOnHit2D());
    // The ball's center, 10 pixels right of and below its position, is at (175, 495): a quarter
    // of the paddle's length right of its middle.
    const position = new Position2D(165, 485);
    const velocity = new Velocity2D(0, 300);
    const body = Object.assign(new RigidBody2D(), { gravity: 0, bounce: 1 });
    spawn(position, velocity, new HitboxCircle2D(10, 10, 10), body);
    registry.addSystem(detectCollisions2D);
    registry.addSystem(deflectOnHit2D);

    run();

    // Half way to the end: half of maxAngle (60 degrees), to the right.
    expect(velocity.x).toBeCloseTo(300 * Math.sin(Math.PI / 6));
    expect(velocity.y).toBeCloseTo(-300 * Math.cos(Math.PI / 6));
    // Its bounding square's bottom is back on the face.
    expect(position).toMatchObject({ x: 165, y: 480 });
  });
  // Removes what touches a "remover" entity, like collect2D or applyDamage2D before the system.
  const removeTouched = (registry: Registry) =>
    registry.getIndexedZipper([HitboxRect2D, Tag]).forEach(({ HitboxRect2D: box, Tag: tag }) => {
      if ((tag as Tag).value !== "remover") return;
      for (const id of (box as HitboxRect2D).collisions)
        registry.killEntity(registry.entityFromIndex(id));
    });

  it("blockOnStaticBodies2D skips a contact removed earlier in the frame", () => {
    const position = new Position2D(0, 0);
    spawn(
      position,
      new Velocity2D(),
      new HitboxRect2D(20, 20),
      new Tag("remover"),
      new RigidBody2D(0),
    );
    const coin = spawn(new Position2D(10, 10), new HitboxCircle2D(5));
    registry.addSystem(detectCollisions2D);
    registry.addSystem(removeTouched);
    registry.addSystem(blockOnStaticBodies2D);

    expect(() => run(frame(16))).not.toThrow();
    expect(alive(HitboxCircle2D, coin)).toBe(false);
    expect(position).toMatchObject({ x: 0, y: 0 });
  });

  it("deflectOnHit2D skips a contact removed earlier in the frame", () => {
    spawn(
      new Position2D(0, 0),
      new HitboxRect2D(100, 10),
      new DeflectOnHit2D(),
      new Tag("remover"),
    );
    const capsule = spawn(new Position2D(10, 5), new HitboxCircle2D(5));
    registry.addSystem(detectCollisions2D);
    registry.addSystem(removeTouched);
    registry.addSystem(deflectOnHit2D);

    expect(() => run(frame(16))).not.toThrow();
    expect(alive(HitboxCircle2D, capsule)).toBe(false);
  });

  const walkInto = (
    box: HitboxRect2D,
    walker: WalkAndJump2D,
    at: Position2D,
    wall: Position2D,
    size: [number, number],
    ms: number,
  ) => {
    spawn(at, new Velocity2D(), box, walker);
    spawn(wall, new HitboxRect2D(...size), new StaticBody2D());
    registry.addSystem(walkAndJump2D);
    world();
    for (let t = 0; t < 1000; t += ms) run(frame(ms));
  };

  it("a thin fast walker stops at a wall instead of sliding through it", () => {
    const position = new Position2D(20, 250);
    const walker = Object.assign(new WalkAndJump2D(1000, "vertical"), { moveY: -1 });
    walkInto(
      new HitboxRect2D(10, 100),
      walker,
      position,
      new Position2D(0, -20),
      [800, 20],
      1000 / 60,
    );

    expect(position.x).toBe(20);
    expect(position.y).toBeCloseTo(0);
  });

  it.each([1000 / 60, 1000 / 30])(
    "a wide flat walker stops at a side wall (frames of %i ms)",
    (ms) => {
      const position = new Position2D(600, 470);
      const walker = Object.assign(new WalkAndJump2D(600, "horizontal"), { moveX: 1 });
      walkInto(new HitboxRect2D(100, 10), walker, position, new Position2D(800, 0), [20, 600], ms);

      expect(position.x).toBeCloseTo(700);
      expect(position.y).toBe(470);
    },
  );

  it("a fast HitboxCircle2D ball bounces off a ceiling instead of going through it", () => {
    const position = new Position2D(400, 30);
    const velocity = new Velocity2D(0, -1400);
    spawn(position, velocity, new HitboxCircle2D(5), new RigidBody2D(0, 1));
    spawn(new Position2D(0, -20), new HitboxRect2D(800, 20), new StaticBody2D());
    world();

    for (let i = 0; i < 3; i++) run(frame(1000 / 60));

    expect(velocity.y).toBe(1400);
    expect(position.y).toBeGreaterThanOrEqual(5);
  });
});
