import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { Tag } from "@nanoforge/basics-2d/components/tag";
import { DamageOnHit2D } from "@nanoforge/combat-2d/components/damage-on-hit-2d";
import { Health } from "@nanoforge/combat-2d/components/health";
import { applyDamage2D } from "@nanoforge/combat-2d/systems/apply-damage-2d";
import { DrawableText2D } from "@nanoforge/graphics-2d/components/drawable-text-2d";
import { HitboxCircle2D } from "@nanoforge/physics-2d/components/hitbox-circle-2d";
import { HitboxRect2D } from "@nanoforge/physics-2d/components/hitbox-rect-2d";
import { StaticBody2D } from "@nanoforge/physics-2d/components/static-body-2d";
import { detectCollisions2D } from "@nanoforge/physics-2d/systems/detect-collisions-2d";
import { AddToVarOnEnter2D } from "@nanoforge/scenes-2d/components/add-to-var-on-enter-2d";
import { Collectible2D } from "@nanoforge/scenes-2d/components/collectible-2d";
import { SceneVarText2D } from "@nanoforge/scenes-2d/components/scene-var-text-2d";
import { addToVarOnEnter2D } from "@nanoforge/scenes-2d/systems/add-to-var-on-enter-2d";
import { collect2D } from "@nanoforge/scenes-2d/systems/collect-2d";
import { showSceneVars2D } from "@nanoforge/scenes-2d/systems/show-scene-vars-2d";
import { describe, expect, it } from "vitest";

import { alive, fake, registry, run, spawn, useEcs } from "./helpers";

useEcs();

describe("scenes-2d", () => {
  it("showSceneVars2D writes a var through its template, and - while it doesn't exist", () => {
    const score = new DrawableText2D();
    const lives = new DrawableText2D();
    spawn(score, new SceneVarText2D("score", "Score {}"));
    spawn(lives, new SceneVarText2D("lives"));
    registry.addSystem(showSceneVars2D);
    fake.vars.set("score", 120);

    run();

    expect(score.text).toBe("Score 120");
    expect(lives.text).toBe("-");
  });

  it("collect2D adds to the var and removes what the tagged entity touches", () => {
    const coin = spawn(new Position2D(0, 0), new HitboxCircle2D(5), new Collectible2D("coins", 10));
    const far = spawn(
      new Position2D(500, 0),
      new HitboxCircle2D(5),
      new Collectible2D("coins", 10),
    );
    spawn(new Position2D(0, 0), new HitboxRect2D(10, 10), new Tag("player"));
    const enemyOnly = spawn(new Position2D(300, 0), new HitboxCircle2D(5), new Collectible2D());
    spawn(new Position2D(300, 0), new HitboxRect2D(10, 10), new Tag("enemy"));
    registry.addSystem(detectCollisions2D);
    registry.addSystem(collect2D);
    fake.vars.set("coins", 5);

    run();

    expect(fake.vars.get("coins")).toBe(15);
    expect(alive(Collectible2D, coin)).toBe(false);
    expect(alive(Collectible2D, far)).toBe(true);
    expect(alive(Collectible2D, enemyOnly)).toBe(true);
    expect(fake.vars.has("score")).toBe(false);
  });

  it("collect2D with an empty by: an untagged entity picks it up, a floor doesn't", () => {
    const coin = spawn(
      new Position2D(0, 0),
      new HitboxCircle2D(5),
      new Collectible2D("score", 3, ""),
    );
    spawn(new Position2D(0, 0), new HitboxRect2D(10, 10));
    const onFloorHitbox = new HitboxCircle2D(5);
    const onFloor = spawn(new Position2D(300, 0), onFloorHitbox, new Collectible2D("score", 3, ""));
    const floor = spawn(new Position2D(250, 0), new HitboxRect2D(100, 10), new StaticBody2D());
    registry.addSystem(detectCollisions2D);
    registry.addSystem(collect2D);

    run();

    expect(alive(Collectible2D, coin)).toBe(false);
    expect(onFloorHitbox.collisions).toEqual([floor.getId()]);
    expect(alive(Collectible2D, onFloor)).toBe(true);
    expect(fake.vars.get("score")).toBe(3);
  });

  it("addToVarOnEnter2D counts a tagged entity once per entry, and never an untagged one", () => {
    fake.vars.set("rightScore", 0);
    spawn(
      new Position2D(0, 0),
      new HitboxRect2D(50, 600),
      new AddToVarOnEnter2D("rightScore", 1, "ball"),
    );
    const ball = new Position2D(100, 100);
    spawn(ball, new HitboxCircle2D(10), new Tag("ball"));
    const untagged = new Position2D(100, 300);
    spawn(untagged, new HitboxRect2D(10, 10));
    registry.addSystem(detectCollisions2D);
    registry.addSystem(addToVarOnEnter2D);

    run();
    expect(fake.vars.get("rightScore")).toBe(0);

    // Inside for three frames: one point.
    ball.x = 20;
    untagged.x = 20;
    run();
    run();
    run();
    expect(fake.vars.get("rightScore")).toBe(1);

    // Out, then in again: one more.
    ball.x = 100;
    run();
    ball.x = 20;
    run();
    expect(fake.vars.get("rightScore")).toBe(2);
  });

  it("addToVarOnEnter2D with an empty by: an untagged ball takes a life, a wall doesn't", () => {
    fake.vars.set("lives", 3);
    spawn(
      new Position2D(0, 590),
      new HitboxRect2D(800, 50),
      new AddToVarOnEnter2D("lives", -1, ""),
    );
    spawn(new Position2D(400, 595), new HitboxCircle2D(10));
    spawn(new Position2D(0, 580), new HitboxRect2D(800, 20), new StaticBody2D());
    registry.addSystem(detectCollisions2D);
    registry.addSystem(addToVarOnEnter2D);

    run();

    expect(fake.vars.get("lives")).toBe(2);
  });

  it("collect2D with an empty by skips an entity removed earlier in the frame", () => {
    spawn(new Position2D(-15, 0), new HitboxRect2D(20, 20), new DamageOnHit2D(10, "enemy"));
    spawn(new Position2D(0, 0), new HitboxRect2D(20, 20), new Tag("enemy"), new Health(10));
    const coin = spawn(
      new Position2D(15, 10),
      new HitboxCircle2D(4),
      new Collectible2D("score", 1, ""),
    );
    registry.addSystem(detectCollisions2D);
    registry.addSystem(applyDamage2D);
    registry.addSystem(collect2D);

    expect(() => run()).not.toThrow();
    expect(alive(Collectible2D, coin)).toBe(true);
    expect(fake.vars.has("score")).toBe(false);
  });

  it("collect2D with an empty by: overlapping coins don't pick each other up", () => {
    const coins = [100, 130, 160, 190].map((x) =>
      spawn(new Position2D(x, 100), new HitboxCircle2D(20), new Collectible2D("score", 10, "")),
    );
    registry.addSystem(detectCollisions2D);
    registry.addSystem(collect2D);
    fake.vars.set("score", 0);

    run();

    for (const coin of coins) expect(alive(Collectible2D, coin)).toBe(true);
    expect(fake.vars.get("score")).toBe(0);
  });

  it("addToVarOnEnter2D with an empty by: zones and coins don't count", () => {
    spawn(
      new Position2D(0, 580),
      new HitboxRect2D(800, 40),
      new AddToVarOnEnter2D("lives", -1, ""),
    );
    spawn(new Position2D(780, 0), new HitboxRect2D(40, 600), new AddToVarOnEnter2D("score", 1, ""));
    spawn(new Position2D(400, 590), new HitboxCircle2D(5), new Collectible2D("coins", 1));
    registry.addSystem(detectCollisions2D);
    registry.addSystem(addToVarOnEnter2D);
    registry.addSystem(collect2D);
    fake.vars.set("lives", 3);
    fake.vars.set("score", 0);

    run();
    run();
    expect(fake.vars.get("lives")).toBe(3);
    expect(fake.vars.get("score")).toBe(0);

    spawn(new Position2D(300, 590), new HitboxCircle2D(5));
    run();
    expect(fake.vars.get("lives")).toBe(2);
  });
});
