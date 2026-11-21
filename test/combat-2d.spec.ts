import type { Context } from "@nanoforge-dev/common";
import { Rect } from "@nanoforge-dev/graphics-2d";
import { Lifetime } from "@nanoforge/basics-2d/components/lifetime";
import { Model } from "@nanoforge/basics-2d/components/model";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { Tag } from "@nanoforge/basics-2d/components/tag";
import { Velocity2D } from "@nanoforge/basics-2d/components/velocity-2d";
import { FromModel } from "@nanoforge/basics-2d/models";
import { expireLifetimes } from "@nanoforge/basics-2d/systems/expire-lifetimes";
import { move2D } from "@nanoforge/basics-2d/systems/move-2d";
import { DamageOnHit2D } from "@nanoforge/combat-2d/components/damage-on-hit-2d";
import { DestroyOnHit2D } from "@nanoforge/combat-2d/components/destroy-on-hit-2d";
import { FaceAim2D } from "@nanoforge/combat-2d/components/face-aim-2d";
import { Health } from "@nanoforge/combat-2d/components/health";
import { HealthBar2D } from "@nanoforge/combat-2d/components/health-bar-2d";
import { Owner } from "@nanoforge/combat-2d/components/owner";
import { Shoot2D } from "@nanoforge/combat-2d/components/shoot-2d";
import { ShootAtNearest2D } from "@nanoforge/combat-2d/components/shoot-at-nearest-2d";
import { applyDamage2D } from "@nanoforge/combat-2d/systems/apply-damage-2d";
import { destroyOnHit2D } from "@nanoforge/combat-2d/systems/destroy-on-hit-2d";
import { drawHealthBars2D } from "@nanoforge/combat-2d/systems/draw-health-bars-2d";
import { faceAim2D } from "@nanoforge/combat-2d/systems/face-aim-2d";
import { shoot2D } from "@nanoforge/combat-2d/systems/shoot-2d";
import { shootAtNearest2D } from "@nanoforge/combat-2d/systems/shoot-at-nearest-2d";
import { showBullets2D } from "@nanoforge/combat-2d/systems/show-bullets-2d";
import { DrawableCircle2D } from "@nanoforge/graphics-2d/components/drawable-circle-2d";
import { DrawableRect2D } from "@nanoforge/graphics-2d/components/drawable-rect-2d";
import { FaceVelocity2D } from "@nanoforge/graphics-2d/components/face-velocity-2d";
import { Hud2D } from "@nanoforge/graphics-2d/components/hud-2d";
import { SpriteAnimation2D } from "@nanoforge/graphics-2d/components/sprite-animation-2d";
import { HitboxCircle2D } from "@nanoforge/physics-2d/components/hitbox-circle-2d";
import { HitboxRect2D } from "@nanoforge/physics-2d/components/hitbox-rect-2d";
import { StaticBody2D } from "@nanoforge/physics-2d/components/static-body-2d";
import { detectCollisions2D } from "@nanoforge/physics-2d/systems/detect-collisions-2d";
import { describe, expect, it } from "vitest";

import {
  alive,
  assets,
  fake,
  fakeLayer,
  frame,
  registry,
  run,
  spawn,
  stubDocument,
  useEcs,
} from "./helpers";

useEcs();
stubDocument();

/** The bullets alive: what `shoot2D` gave an `Owner`. */
const bullets = () => registry.getZipper([Owner, Position2D]);

describe("combat-2d", () => {
  it("applyDamage2D hurts once per contact and kills at 0", () => {
    const health = new Health(15);
    spawn(new Position2D(0, 0), new HitboxRect2D(10, 10), health);
    spawn(new Position2D(5, 5), new HitboxCircle2D(2), new DamageOnHit2D(10, "", 0));
    registry.addSystem(detectCollisions2D);
    registry.addSystem(applyDamage2D);

    run();
    run();
    expect(health.current).toBe(5);

    registry.clearEntities();
    const again = new Health(15);
    again.current = 5;
    const target = spawn(new Position2D(0, 0), new HitboxRect2D(10, 10), again);
    spawn(new Position2D(5, 5), new HitboxCircle2D(2), new DamageOnHit2D(10, "", 0));
    expect(alive(Health, target)).toBe(true);
    run();
    expect(alive(Health, target)).toBe(false);
  });

  it("applyDamage2D hurts only the Health tagged with its target", () => {
    const player = new Health();
    const enemy = new Health();
    spawn(new Position2D(0, 0), new HitboxRect2D(10, 10), new Tag("p2 player"), player);
    spawn(new Position2D(0, 0), new HitboxRect2D(10, 10), new Tag("enemy"), enemy);
    spawn(new Position2D(5, 5), new HitboxCircle2D(2), new DamageOnHit2D(10, "player"));
    registry.addSystem(detectCollisions2D);
    registry.addSystem(applyDamage2D);

    run();
    expect(player.current).toBe(90);
    expect(enemy.current).toBe(100);
  });

  it("applyDamage2D hurts again after a second while they keep touching", () => {
    const health = new Health();
    spawn(new Position2D(0, 0), new HitboxRect2D(10, 10), health);
    spawn(new Position2D(5, 5), new HitboxCircle2D(2), new DamageOnHit2D(10));
    registry.addSystem(detectCollisions2D);
    registry.addSystem(applyDamage2D);

    run(frame(500));
    expect(health.current).toBe(90);
    run(frame(500));
    expect(health.current).toBe(90);
    run(frame(500));
    expect(health.current).toBe(80);
  });

  it("applyDamage2D heals with a negative damage, up to max", () => {
    const health = new Health();
    health.current = 90;
    spawn(new Position2D(0, 0), new HitboxRect2D(10, 10), health);
    spawn(new Position2D(5, 5), new HitboxCircle2D(2), new DamageOnHit2D(-20));
    registry.addSystem(detectCollisions2D);
    registry.addSystem(applyDamage2D);

    run();
    expect(health.current).toBe(100);
  });

  it("applyDamage2D keeps the entity at 0 while its removeAtZero is off", () => {
    const health = new Health(10, false);
    const hurt = spawn(new Position2D(0, 0), new HitboxRect2D(10, 10), health);
    spawn(new Position2D(5, 5), new HitboxCircle2D(2), new DamageOnHit2D(50));
    registry.addSystem(detectCollisions2D);
    registry.addSystem(applyDamage2D);

    run();
    expect(health.current).toBe(0);
    expect(alive(Health, hurt)).toBe(true);
  });

  it("destroyOnHit2D ignores the owner, and static bodies when asked", () => {
    const owner = spawn(new Position2D(0, 0), new HitboxRect2D(10, 10));
    const wall = spawn(new Position2D(0, 0), new HitboxRect2D(10, 10), new StaticBody2D());
    const bullet = spawn(
      new Position2D(5, 5),
      new HitboxCircle2D(2),
      new DestroyOnHit2D(false),
      Object.assign(new Owner(), { entity: owner.getId() }),
    );
    registry.addSystem(detectCollisions2D);
    registry.addSystem(destroyOnHit2D);

    run();
    expect(alive(DestroyOnHit2D, bullet)).toBe(true);

    registry.removeComponent(wall, StaticBody2D);
    run();
    expect(alive(DestroyOnHit2D, bullet)).toBe(false);
  });

  it("destroyOnHit2D with by passes an untagged entity, and stops on a wall and on a tagged one", () => {
    const crate = spawn(new Position2D(0, 0), new HitboxRect2D(10, 10));
    const rock = spawn(
      new Position2D(5, 5),
      new HitboxCircle2D(2),
      new DestroyOnHit2D(true, "player"),
    );
    registry.addSystem(detectCollisions2D);
    registry.addSystem(destroyOnHit2D);

    run();
    expect(alive(DestroyOnHit2D, rock)).toBe(true);

    registry.addComponent(crate, new StaticBody2D());
    run();
    expect(alive(DestroyOnHit2D, rock)).toBe(false);

    // A health pack: the floor under it doesn't count, the player does.
    const pack = spawn(
      new Position2D(5, 5),
      new HitboxCircle2D(2),
      new DestroyOnHit2D(false, "player"),
    );
    run();
    expect(alive(DestroyOnHit2D, pack)).toBe(true);
    spawn(new Position2D(0, 0), new HitboxRect2D(10, 10), new Tag("player"));
    run();
    expect(alive(DestroyOnHit2D, pack)).toBe(false);
  });

  it("two overlapping bullets of one shooter don't destroy each other, nor does the shooter", () => {
    spawn(
      new Position2D(0, 0),
      new HitboxRect2D(20, 20),
      Object.assign(new Shoot2D(true), { bulletsPerShot: 2 }),
    );
    registry.addSystem(shoot2D);
    registry.addSystem(detectCollisions2D);
    registry.addSystem(destroyOnHit2D);

    run(frame(16));
    expect(bullets()).toHaveLength(2);
  });

  it("a bullet that kills the enemy it hits goes, and spares the one behind", () => {
    spawn(new Position2D(0, 0), new HitboxRect2D(20, 20), new Shoot2D(true, 1, 1, 0, "enemy"));
    const front = spawn(
      new Position2D(100, 0),
      new HitboxRect2D(20, 20),
      new Tag("enemy"),
      new Health(10),
    );
    const behind = new Health(10);
    spawn(new Position2D(115, 0), new HitboxRect2D(20, 20), new Tag("enemy"), behind);
    for (const system of [shoot2D, move2D, detectCollisions2D, applyDamage2D, destroyOnHit2D])
      registry.addSystem(system);

    for (let i = 0; i < 30; i++) run(frame(1000 / 60));
    expect(alive(Health, front)).toBe(false);
    expect(behind.current).toBe(10);
    expect(bullets()).toHaveLength(0);
  });

  it("a coin removed earlier in the frame is no hit for a bullet aimed at enemies", () => {
    const shooter = spawn(new Position2D(500, 500));
    const coin = spawn(new Position2D(0, 0), new HitboxRect2D(10, 10), new Tag("coin"));
    const bullet = spawn(
      new Position2D(5, 5),
      new HitboxCircle2D(2),
      new DamageOnHit2D(10, "enemy"),
      new DestroyOnHit2D(true, "enemy"),
      Object.assign(new Owner(), { entity: shooter.getId() }),
    );
    registry.addSystem(detectCollisions2D);
    // As collect2D does with a coin, between detectCollisions2D and them.
    registry.addSystem((ecs) => ecs.killEntity(coin));
    registry.addSystem(applyDamage2D);
    registry.addSystem(destroyOnHit2D);

    run();
    expect(alive(DestroyOnHit2D, bullet)).toBe(true);
  });

  it("a health pack stays when an enemy on it is killed in the same frame", () => {
    const enemy = spawn(
      new Position2D(0, 0),
      new HitboxRect2D(20, 20),
      new Tag("enemy"),
      new Health(10),
    );
    spawn(new Position2D(0, 0), new HitboxRect2D(20, 20), new DamageOnHit2D(10, "enemy"));
    const pack = spawn(
      new Position2D(5, 5),
      new HitboxRect2D(10, 10),
      new DamageOnHit2D(-20, "player"),
      new DestroyOnHit2D(false, "player"),
    );
    for (const system of [detectCollisions2D, applyDamage2D, destroyOnHit2D])
      registry.addSystem(system);

    run();
    expect(alive(Health, enemy)).toBe(false);
    expect(alive(DestroyOnHit2D, pack)).toBe(true);
  });

  it("an entity with an empty by still takes a contact removed earlier in the frame as a hit", () => {
    const coin = spawn(new Position2D(0, 0), new HitboxRect2D(10, 10));
    const rock = spawn(new Position2D(5, 5), new HitboxCircle2D(2), new DestroyOnHit2D());
    registry.addSystem(detectCollisions2D);
    registry.addSystem((ecs) => ecs.killEntity(coin));
    registry.addSystem(destroyOnHit2D);

    run();
    expect(alive(DestroyOnHit2D, rock)).toBe(false);
  });

  it("a shooter with DestroyOnHit2D outlives its own bullets, not another's", () => {
    const shooter = spawn(
      new Position2D(0, 0),
      new HitboxRect2D(20, 20),
      new Shoot2D(true, 1, 1, 0, "player"),
      new DestroyOnHit2D(true, "bullet"),
    );
    const any = spawn(
      new Position2D(0, 300),
      new HitboxRect2D(20, 20),
      new Shoot2D(true, 1, 1, 0, "player"),
      new DestroyOnHit2D(),
    );
    for (const system of [shoot2D, move2D, detectCollisions2D, applyDamage2D, destroyOnHit2D])
      registry.addSystem(system);

    run(frame(1000 / 60));
    expect(alive(Shoot2D, shooter)).toBe(true);
    expect(alive(Shoot2D, any)).toBe(true);
    expect(bullets()).toHaveLength(2);

    const target = spawn(
      new Position2D(60, 0),
      new HitboxRect2D(20, 20),
      new DestroyOnHit2D(true, "bullet"),
    );
    for (let i = 0; i < 30; i++) run(frame(1000 / 60));
    expect(alive(DestroyOnHit2D, target)).toBe(false);
  });
});

describe("Shoot2D", () => {
  it("takes its settings in order, and fires right three times a second by default", () => {
    expect(new Shoot2D(true, 7, 0, -1, "enemy", 300, 5, 200, 3, 30, "bolt")).toMatchObject({
      fire: true,
      fireRate: 7,
      aimX: 0,
      aimY: -1,
      target: "enemy",
      bulletSpeed: 300,
      damage: 5,
      range: 200,
      bulletsPerShot: 3,
      spreadAngle: 30,
      bulletModel: "bolt",
    });
    expect(new Shoot2D()).toMatchObject({
      fire: false,
      fireRate: 3,
      aimX: 1,
      aimY: 0,
      target: "",
      bulletSpeed: 600,
      damage: 10,
      range: 1000,
      bulletsPerShot: 1,
      spreadAngle: 0,
      bulletModel: "bullet",
      cooldown: 0,
      fireRequested: false,
    });
  });
});

describe("shoot2D", () => {
  it("fires a default bullet from the middle of the hitbox, then waits for its cooldown", () => {
    const shoot = new Shoot2D(true);
    const shooter = spawn(new Position2D(100, 100), new HitboxRect2D(20, 20), shoot);
    registry.addSystem(shoot2D);

    run(frame(100));
    const [bullet] = registry.getZipper([
      Owner,
      Position2D,
      Velocity2D,
      HitboxCircle2D,
      Tag,
      FromModel,
      DamageOnHit2D,
      DestroyOnHit2D,
      Lifetime,
    ]);
    expect(bullet.Owner.entity).toBe(shooter.getId());
    expect(bullet.Position2D).toMatchObject({ x: 110, y: 110 });
    expect(bullet.Velocity2D).toMatchObject({ x: 600, y: 0 });
    expect(bullet.HitboxCircle2D).toMatchObject({ radius: 5, offsetX: 0, offsetY: 0 });
    expect(bullet.Tag.value).toBe("bullet");
    expect(bullet.FromModel.model).toBe("bullet");
    expect(bullet.DamageOnHit2D).toMatchObject({ damage: 10, target: "", hitRate: 1 });
    expect(bullet.DestroyOnHit2D).toMatchObject({ onStaticBodies: true, by: "" });
    expect(bullet.Lifetime.seconds).toBeCloseTo(1000 / 600);
    expect(shoot.cooldown).toBeCloseTo(1 / 3 - 0.1);

    run(frame(100));
    expect(bullets()).toHaveLength(1);
    run(frame(200));
    expect(bullets()).toHaveLength(2);
  });

  it("fireRate 7 fires 70 bullets in 10 s at 60 fps, not 67", () => {
    spawn(new Position2D(0, 0), new Shoot2D(true, 7));
    registry.addSystem(shoot2D);

    // The 71st shot is due on frame 600, at 10 s exactly, where rounding decides: stop just before.
    for (let i = 0; i < 599; i++) run(frame(1000 / 60));
    expect(bullets()).toHaveLength(70);
  });

  it("copies the model's rectangle hitbox, with fresh collisions, centered on the shooter's", () => {
    const hitbox = new HitboxRect2D(10, 4, 2, 1);
    hitbox.collisions.push(42);
    spawn(new Tag("bolt"), new Model(), hitbox);
    spawn(
      new Position2D(100, 100),
      new HitboxRect2D(20, 20),
      Object.assign(new Shoot2D(true), { bulletModel: "bolt" }),
    );
    registry.addSystem(shoot2D);

    run(frame(16));
    const [bullet] = registry.getZipper([Owner, Position2D, HitboxRect2D, Tag, FromModel]);
    expect(bullet.HitboxRect2D).not.toBe(hitbox);
    expect(bullet.HitboxRect2D).toMatchObject({ width: 10, height: 4, offsetX: 2, offsetY: 1 });
    expect(bullet.HitboxRect2D.collisions).toEqual([]);
    // Its middle, the position plus the offset and half the size, is the shooter's (110, 110).
    expect(bullet.Position2D).toMatchObject({ x: 103, y: 107 });
    expect(bullet.Tag.value).toBe("bolt");
    expect(bullet.FromModel.model).toBe("bolt");
    expect(registry.getZipper([Owner, HitboxCircle2D])).toHaveLength(0);
  });

  it("holds fire with an aim of (0, 0), a NaN aim, or a fireRate of 0", () => {
    spawn(new Position2D(0, 0), new Shoot2D(true, 3, 0, 0));
    spawn(new Position2D(0, 0), new Shoot2D(true, 3, Number.NaN, 1));
    spawn(new Position2D(0, 0), new Shoot2D(true, 0));
    registry.addSystem(shoot2D);

    run();
    expect(bullets()).toHaveLength(0);
  });

  it("fans 3 bullets with a 30-degree spread at -15, 0 and 15 degrees off the aim", () => {
    spawn(
      new Position2D(0, 0),
      Object.assign(new Shoot2D(true), { bulletsPerShot: 3, spreadAngle: 30 }),
    );
    registry.addSystem(shoot2D);

    run(frame(16));
    const velocities = registry.getZipper([Owner, Velocity2D]).map(({ Velocity2D }) => Velocity2D);
    const angles = velocities
      .map(({ x, y }) => (Math.atan2(y, x) * 180) / Math.PI)
      .sort((a, b) => a - b);
    expect(angles).toHaveLength(3);
    expect(angles[0]).toBeCloseTo(-15);
    expect(angles[1]).toBeCloseTo(0);
    expect(angles[2]).toBeCloseTo(15);
    for (const { x, y } of velocities) expect(Math.hypot(x, y)).toBeCloseTo(600);
  });

  it("fires one shot for fireRequested, with fire off", () => {
    const shoot = new Shoot2D();
    shoot.fireRequested = true;
    spawn(new Position2D(0, 0), shoot);
    registry.addSystem(shoot2D);

    run(frame(16));
    expect(shoot.fireRequested).toBe(false);
    expect(bullets()).toHaveLength(1);
    run();
    expect(bullets()).toHaveLength(1);
  });
});

describe("shootAtNearest2D", () => {
  it("aims at the nearest entity tagged with the Shoot2D's target in range, and fires", () => {
    const shoot = new Shoot2D(false, 1, 1, 0, "player");
    spawn(new Position2D(0, 0), new HitboxRect2D(20, 20), shoot, new ShootAtNearest2D());
    spawn(new Position2D(110, 0), new HitboxRect2D(20, 20), new Tag("player"));
    spawn(new Position2D(0, -300), new Tag("p2 player"));
    spawn(new Position2D(30, 0), new HitboxRect2D(20, 20), new Tag("enemy"));
    spawn(new Tag("player"), new Model());
    registry.addSystem(shootAtNearest2D);

    run();
    // From the middle of its hitbox (10, 10) to the middle of the player's (120, 10).
    expect(shoot).toMatchObject({ fire: true, aimX: 110, aimY: 0 });
  });

  it("holds fire while nothing is in range, and keeps its aim", () => {
    const shoot = Object.assign(new Shoot2D(true, 1, 0, -1, "player"), { range: 50 });
    spawn(new Position2D(0, 0), shoot, new ShootAtNearest2D());
    spawn(new Position2D(100, 0), new Tag("player"));
    registry.addSystem(shootAtNearest2D);

    run();
    expect(shoot).toMatchObject({ fire: false, aimX: 0, aimY: -1 });
  });

  it("leaves out itself, its owner and a Health at 0, and takes any Health without a target", () => {
    const shoot = new Shoot2D();
    const owner = spawn(new Position2D(10, 0), new Health(10));
    spawn(
      new Position2D(0, 0),
      new Health(10),
      shoot,
      new ShootAtNearest2D(),
      Object.assign(new Owner(), { entity: owner.getId() }),
    );
    const dead = new Health(10, false);
    dead.current = 0;
    spawn(new Position2D(20, 0), dead);
    spawn(new Position2D(-200, 0), new Health(10));
    registry.addSystem(shootAtNearest2D);

    run();
    expect(shoot).toMatchObject({ fire: true, aimX: -200, aimY: 0 });
  });

  it("makes a turret whose bullets fly to the player, hurt it and go", () => {
    spawn(
      new Position2D(0, 0),
      new HitboxRect2D(20, 20),
      new Tag("enemy"),
      new Shoot2D(false, 1, 1, 0, "player"),
      new ShootAtNearest2D(),
    );
    const health = new Health(50);
    spawn(new Position2D(200, 0), new HitboxRect2D(20, 20), new Tag("player"), health);
    for (const system of [
      shootAtNearest2D,
      shoot2D,
      move2D,
      detectCollisions2D,
      applyDamage2D,
      destroyOnHit2D,
      expireLifetimes,
    ])
      registry.addSystem(system);

    for (let i = 0; i < 30; i++) run(frame(1000 / 60));
    expect(health.current).toBe(40);
    expect(bullets()).toHaveLength(0);
  });
});

describe("showBullets2D", () => {
  it("copies the model's drawable, with a fresh shape", () => {
    const look = Object.assign(new DrawableRect2D(), {
      width: 20,
      height: 6,
      fillColor: "#ff4040",
      shape: new Rect(),
    });
    spawn(new Tag("bullet"), new Model(), look, new HitboxCircle2D(3, 10, 3));
    spawn(new Position2D(0, 0), new HitboxRect2D(20, 20), new Shoot2D(true));
    registry.addSystem(shoot2D);
    registry.addSystem(showBullets2D);

    run(frame(16));
    const [bullet] = registry.getZipper([Owner, DrawableRect2D]);
    expect(bullet.DrawableRect2D).not.toBe(look);
    expect(bullet.DrawableRect2D.shape).toBeUndefined();
    expect(bullet.DrawableRect2D).toEqual({ ...look, shape: undefined });
  });

  it("copies the model's FaceVelocity2D and SpriteAnimation2D, which starts on its first frame", () => {
    const animation = Object.assign(new SpriteAnimation2D(), { frames: 6, row: 1 });
    const facing = new FaceVelocity2D();
    spawn(new Tag("bullet"), new Model(), new DrawableRect2D(), animation, facing);
    spawn(new Position2D(0, 0), new Shoot2D(true));
    registry.addSystem(shoot2D);
    registry.addSystem(showBullets2D);

    run(frame(16));
    const [bullet] = registry.getZipper([Owner, DrawableRect2D, SpriteAnimation2D, FaceVelocity2D]);
    expect(bullet.SpriteAnimation2D).not.toBe(animation);
    expect(bullet.SpriteAnimation2D).toEqual(animation);
    expect(bullet.SpriteAnimation2D.frame).toBe(0);
    expect(bullet.FaceVelocity2D).not.toBe(facing);
    expect(bullet.FaceVelocity2D).toEqual(facing);
  });

  it("gives a bullet without a model's look a grey shape the size of its hitbox", () => {
    spawn(new Position2D(0, 0), new Shoot2D(true));
    spawn(new Tag("brick"), new Model(), new HitboxRect2D(8, 4));
    spawn(new Position2D(0, 0), Object.assign(new Shoot2D(true), { bulletModel: "brick" }));
    registry.addSystem(shoot2D);
    registry.addSystem(showBullets2D);

    run(frame(16));
    const [dot] = registry.getZipper([Owner, DrawableCircle2D]);
    expect(dot.DrawableCircle2D).toMatchObject({ radius: 5, fillColor: "#cccccc" });
    const [brick] = registry.getZipper([Owner, DrawableRect2D]);
    expect(brick.DrawableRect2D).toMatchObject({ width: 8, height: 4, fillColor: "#cccccc" });
  });

  it("leaves an owned entity without FromModel undrawn", () => {
    const owned = spawn(
      new Position2D(0, 0),
      new HitboxCircle2D(5),
      Object.assign(new Owner(), { entity: 0 }),
    );
    registry.addSystem(showBullets2D);

    run();
    expect(alive(DrawableCircle2D, owned)).toBe(false);
    expect(alive(DrawableRect2D, owned)).toBe(false);
  });
});

describe("faceAim2D", () => {
  it("turns a turret aimed (0, 1) by 90 degrees, and keeps its look without an aim", () => {
    const look = new DrawableRect2D();
    const shoot = new Shoot2D(false, 1, 0, 1);
    spawn(new Position2D(0, 0), look, shoot, new FaceAim2D());
    registry.addSystem(faceAim2D);

    run();
    expect(look.rotation).toBeCloseTo(90);
    expect(look.flipX).toBe(false);

    Object.assign(shoot, { aimX: 0, aimY: 0 });
    run();
    Object.assign(shoot, { aimX: Number.NaN });
    run();
    expect(look.rotation).toBeCloseTo(90);
  });

  it("with keepUpright, mirrors a sprite that walks right but aims left", () => {
    const look = new DrawableRect2D();
    spawn(new Position2D(0, 0), look, new Shoot2D(false, 1, -1, 0), new FaceAim2D("right", true));
    registry.addSystem(faceAim2D);
    // What animateMoves2D, which runs before, leaves on a sprite walking right.
    look.flipX = false;

    run();
    expect(look.flipX).toBe(true);
    expect(look.rotation).toBeCloseTo(0);
  });
});

describe("drawHealthBars2D", () => {
  it("draws a bar over each entity with health, and removes it with the entity", () => {
    const layer = fakeLayer();
    const ctx = { graphics: { baseLayer: layer }, assets } as unknown as Context;
    const health = new Health(100);
    health.current = 25;
    const bar = new HealthBar2D(40, 6, 4);
    const boxed = spawn(new Position2D(100, 100), new HitboxRect2D(20, 20), health, bar);
    const round = new HealthBar2D(10, 2, 0);
    spawn(
      new Position2D(50, 50),
      Object.assign(new DrawableCircle2D(), { radius: 10 }),
      new Health(5),
      round,
    );
    registry.addSystem(drawHealthBars2D);

    registry.runSystems(ctx);
    expect(bar.back?.getAttrs()).toMatchObject({ x: 90, y: 90, width: 40, height: 6 });
    expect(bar.fill?.getAttrs()).toMatchObject({ x: 90, width: 10, fill: "#5ec26a" });
    expect(round.back?.getAttrs()).toMatchObject({ x: 45, y: 38 });

    registry.killEntity(boxed);
    registry.runSystems(ctx);
    expect(bar.back).toBeUndefined();
    expect(round.back).toBeDefined();
  });

  it("puts a Hud2D bar on the HUD layer, and a world bar on the world's", () => {
    const hud = new HealthBar2D();
    spawn(new Position2D(20, 20), new Hud2D(), new Health(), hud);
    const world = new HealthBar2D();
    spawn(new Position2D(300, 300), new HitboxRect2D(20, 20), new Health(), world);
    registry.addSystem(drawHealthBars2D);

    run();
    expect(fake.stage.layers).toHaveLength(1);
    expect(hud.back?.getParent()).toBe(fake.stage.layers[0]);
    expect(fake.baseLayer.shapes).toContain(world.back);
  });

  it("shows the Health of the entity tagged target at its own position", () => {
    const bar = new HealthBar2D(200, 16, 0, "#5ec26a", "#3a3a3a", "player");
    spawn(new Position2D(20, 20), new Hud2D(), bar);
    spawn(new Position2D(500, 500), new Tag("player"));
    const health = new Health();
    health.current = 50;
    const player = spawn(
      new Position2D(400, 400),
      new HitboxRect2D(20, 20),
      new Tag("player"),
      health,
    );
    registry.addSystem(drawHealthBars2D);

    run();
    expect(bar.back?.getAttrs()).toMatchObject({ x: 20, y: 20, width: 200, height: 16 });
    expect(bar.fill?.getAttrs()).toMatchObject({ x: 20, y: 20, width: 100 });

    registry.killEntity(player);
    run();
    expect(bar.back).toBeUndefined();
  });
});
