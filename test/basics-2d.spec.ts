import { Acceleration2D } from "@nanoforge/basics-2d/components/acceleration-2d";
import { Follow2D } from "@nanoforge/basics-2d/components/follow-2d";
import { Lifetime } from "@nanoforge/basics-2d/components/lifetime";
import { Model } from "@nanoforge/basics-2d/components/model";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { Tag } from "@nanoforge/basics-2d/components/tag";
import { Velocity2D } from "@nanoforge/basics-2d/components/velocity-2d";
import { FromModel, copyOf, modelOf } from "@nanoforge/basics-2d/models";
import { expireLifetimes } from "@nanoforge/basics-2d/systems/expire-lifetimes";
import { follow2D } from "@nanoforge/basics-2d/systems/follow-2d";
import { move2D } from "@nanoforge/basics-2d/systems/move-2d";
import { hasTag, taggedIds } from "@nanoforge/basics-2d/tags";
import { HitboxCircle2D } from "@nanoforge/physics-2d/components/hitbox-circle-2d";
import { HitboxRect2D } from "@nanoforge/physics-2d/components/hitbox-rect-2d";
import { detectCollisions2D } from "@nanoforge/physics-2d/systems/detect-collisions-2d";
import { Collectible2D } from "@nanoforge/scenes-2d/components/collectible-2d";
import { collect2D } from "@nanoforge/scenes-2d/systems/collect-2d";
import { describe, expect, it } from "vitest";

import { alive, fake, frame, registry, run, spawn, useEcs } from "./helpers";

useEcs();

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

  it("expireLifetimes removes an entity once its time is up", () => {
    const lifetime = new Lifetime(1);
    const entity = spawn(lifetime);
    registry.addSystem(expireLifetimes);

    run(frame(600));
    expect(alive(Lifetime, entity)).toBe(true);
    expect(lifetime.left).toBeCloseTo(0.4);

    run(frame(600));
    expect(alive(Lifetime, entity)).toBe(false);
  });

  it("follow2D sticks to the tagged entity, or glides after it with a lag", () => {
    spawn(new Position2D(100, 50), new Tag("player"));
    const name = new Position2D(0, 0);
    const trailing = new Position2D(0, 0);
    spawn(name, new Follow2D("player", 0, -20));
    spawn(trailing, new Follow2D("player", 0, 0, 0.5));
    const lost = new Position2D(7, 7);
    spawn(lost, new Follow2D("nobody"));
    registry.addSystem(follow2D);

    run(frame(500));

    expect(name).toMatchObject({ x: 100, y: 30 });
    expect(trailing.x).toBeCloseTo(100 * (1 - Math.exp(-1)));
    expect(lost).toMatchObject({ x: 7, y: 7 });
  });

  it("expireLifetimes leaves a Model's Lifetime alone", () => {
    const lifetime = new Lifetime(1);
    const model = spawn(new Tag("bullet"), new Model(), lifetime);
    registry.addSystem(expireLifetimes);

    run(frame(2000));

    expect(alive(Lifetime, model)).toBe(true);
    expect(lifetime.left).toBe(1);
  });

  it("follow2D follows the first other tagged entity that has a Position2D", () => {
    const follower = new Position2D();
    spawn(follower, new Tag("player"), new Follow2D("player"));
    spawn(new Tag("player"), new Model());
    spawn(new Position2D(30, 40), new Tag("player"));
    registry.addSystem(follow2D);

    run();

    expect(follower).toMatchObject({ x: 30, y: 40 });
  });

  it("a Tag of several words is found by any of them, and an empty word finds nothing", () => {
    const player = new Position2D(100, 50);
    spawn(player, new HitboxRect2D(10, 10), new Tag("player p2"));
    const follower = new Position2D();
    spawn(follower, new Follow2D("p2"));
    const coin = spawn(
      new Position2D(105, 55),
      new HitboxCircle2D(5),
      new Collectible2D("score", 1, "player"),
    );
    const nameless = spawn(new Tag(""));
    registry.addSystem(detectCollisions2D);
    registry.addSystem(collect2D);
    registry.addSystem(follow2D);

    run();

    expect(follower).toMatchObject({ x: 100, y: 50 });
    expect(alive(Collectible2D, coin)).toBe(false);
    expect(fake.vars.get("score")).toBe(1);
    expect(taggedIds(registry, "")).toEqual([]);
    expect(hasTag(registry, nameless.getId(), "")).toBe(false);
  });

  it("hasTag is false for an entity removed earlier in the frame, instead of throwing", () => {
    const enemy = spawn(new Tag("enemy"));
    const id = enemy.getId();
    let seen: boolean | undefined;
    registry.addSystem(() => registry.killEntity(enemy));
    registry.addSystem(() => {
      seen = hasTag(registry, id, "enemy");
    });

    run();

    expect(seen).toBe(false);
  });

  it("modelOf finds the first tagged entity with a Model, even one with a Position2D", () => {
    spawn(new Tag("bullet"));
    const model = spawn(new Tag("bolt bullet"), new Model(), new Position2D());
    spawn(new Tag("bullet"), new Model());

    expect(modelOf(registry, "bullet")).toBe(model.getId());
    expect(modelOf(registry, "rocket")).toBeUndefined();
    expect(modelOf(registry, "")).toBeUndefined();
  });

  it("copyOf copies a component's numbers, strings and booleans, and makes its objects anew", () => {
    const hitbox = new HitboxRect2D(8, 4);
    hitbox.collisions.push(3);

    const copy = copyOf(hitbox);

    expect(copy).toBeInstanceOf(HitboxRect2D);
    expect(copy).toMatchObject({ name: "HitboxRect2D", width: 8, height: 4, collisions: [] });
    expect(copy.collisions).not.toBe(hitbox.collisions);
    expect(copyOf(new FromModel("bolt"))).toMatchObject({ name: "FromModel", model: "bolt" });
  });
});
