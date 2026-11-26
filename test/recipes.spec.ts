import type { Context } from "@nanoforge-dev/common";
import { Layer } from "@nanoforge-dev/graphics-2d";
import { Mesh, PerspectiveCamera, Scene } from "@nanoforge-dev/graphics-3d/three";
import { InputEnum } from "@nanoforge-dev/input";
import { ControllerButton } from "@nanoforge-dev/input/controller";
import { MuteOnKey } from "@nanoforge/audio/components/mute-on-key";
import { isMuted, setMuted } from "@nanoforge/audio/mute-state";
import { muteMusicOnKey } from "@nanoforge/audio/systems/mute-music-on-key";
import { Lifetime } from "@nanoforge/basics-2d/components/lifetime";
import { Model } from "@nanoforge/basics-2d/components/model";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { Tag } from "@nanoforge/basics-2d/components/tag";
import { Velocity2D } from "@nanoforge/basics-2d/components/velocity-2d";
import { FromModel } from "@nanoforge/basics-2d/models";
import { expireLifetimes } from "@nanoforge/basics-2d/systems/expire-lifetimes";
import { move2D } from "@nanoforge/basics-2d/systems/move-2d";
import { Position3D } from "@nanoforge/basics-3d/components/position-3d";
import { Velocity3D } from "@nanoforge/basics-3d/components/velocity-3d";
import { move3D } from "@nanoforge/basics-3d/systems/move-3d";
import { DamageOnHit2D } from "@nanoforge/combat-2d/components/damage-on-hit-2d";
import { DestroyOnHit2D } from "@nanoforge/combat-2d/components/destroy-on-hit-2d";
import { FaceAim2D } from "@nanoforge/combat-2d/components/face-aim-2d";
import { Health } from "@nanoforge/combat-2d/components/health";
import { HealthBar2D } from "@nanoforge/combat-2d/components/health-bar-2d";
import { Shoot2D } from "@nanoforge/combat-2d/components/shoot-2d";
import { ShootAtNearest2D } from "@nanoforge/combat-2d/components/shoot-at-nearest-2d";
import { applyDamage2D } from "@nanoforge/combat-2d/systems/apply-damage-2d";
import { destroyOnHit2D } from "@nanoforge/combat-2d/systems/destroy-on-hit-2d";
import { drawHealthBars2D } from "@nanoforge/combat-2d/systems/draw-health-bars-2d";
import { faceAim2D } from "@nanoforge/combat-2d/systems/face-aim-2d";
import { shoot2D } from "@nanoforge/combat-2d/systems/shoot-2d";
import { shootAtNearest2D } from "@nanoforge/combat-2d/systems/shoot-at-nearest-2d";
import { showBullets2D } from "@nanoforge/combat-2d/systems/show-bullets-2d";
import { Clickable2D } from "@nanoforge/controls-2d/components/clickable-2d";
import { ColorOnHover2D } from "@nanoforge/controls-2d/components/color-on-hover-2d";
import { Draggable2D } from "@nanoforge/controls-2d/components/draggable-2d";
import { FollowMouse2D } from "@nanoforge/controls-2d/components/follow-mouse-2d";
import { GamepadControls2D } from "@nanoforge/controls-2d/components/gamepad-controls-2d";
import { KeyboardControls2D } from "@nanoforge/controls-2d/components/keyboard-controls-2d";
import { click2D } from "@nanoforge/controls-2d/systems/click-2d";
import { colorOnHover2D } from "@nanoforge/controls-2d/systems/color-on-hover-2d";
import { drag2D } from "@nanoforge/controls-2d/systems/drag-2d";
import { followMouse2D } from "@nanoforge/controls-2d/systems/follow-mouse-2d";
import { readGamepad2D } from "@nanoforge/controls-2d/systems/read-gamepad-2d";
import { readKeyboard2D } from "@nanoforge/controls-2d/systems/read-keyboard-2d";
import { Camera2D } from "@nanoforge/graphics-2d/components/camera-2d";
import { DrawableCircle2D } from "@nanoforge/graphics-2d/components/drawable-circle-2d";
import { DrawableRect2D } from "@nanoforge/graphics-2d/components/drawable-rect-2d";
import { DrawableText2D } from "@nanoforge/graphics-2d/components/drawable-text-2d";
import { FaceTarget2D } from "@nanoforge/graphics-2d/components/face-target-2d";
import { FaceVelocity2D } from "@nanoforge/graphics-2d/components/face-velocity-2d";
import { FadeOut2D } from "@nanoforge/graphics-2d/components/fade-out-2d";
import { Hud2D } from "@nanoforge/graphics-2d/components/hud-2d";
import { MoveAnimation2D } from "@nanoforge/graphics-2d/components/move-animation-2d";
import { SpriteAnimation2D } from "@nanoforge/graphics-2d/components/sprite-animation-2d";
import { animateMoves2D } from "@nanoforge/graphics-2d/systems/animate-moves-2d";
import { animateSprites2D } from "@nanoforge/graphics-2d/systems/animate-sprites-2d";
import { draw2D } from "@nanoforge/graphics-2d/systems/draw-2d";
import { faceTarget2D } from "@nanoforge/graphics-2d/systems/face-target-2d";
import { faceVelocity2D } from "@nanoforge/graphics-2d/systems/face-velocity-2d";
import { fadeOut2D } from "@nanoforge/graphics-2d/systems/fade-out-2d";
import { followCamera2D } from "@nanoforge/graphics-2d/systems/follow-camera-2d";
import { Box3D } from "@nanoforge/graphics-3d/components/box-3d";
import { Camera3D } from "@nanoforge/graphics-3d/components/camera-3d";
import { Light3D } from "@nanoforge/graphics-3d/components/light-3d";
import { Sphere3D } from "@nanoforge/graphics-3d/components/sphere-3d";
import { draw3D } from "@nanoforge/graphics-3d/systems/draw-3d";
import { NetworkId } from "@nanoforge/network-2d/components/network-id";
import { Sync2DPacket, SyncRequestPacket } from "@nanoforge/network-2d/sync-packets";
import { syncFromServer2D } from "@nanoforge/network-2d/systems/sync-from-server-2d";
import { syncToClients2D } from "@nanoforge/network-2d/systems/sync-to-clients-2d";
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
import { AddToVarOnEnter2D } from "@nanoforge/scenes-2d/components/add-to-var-on-enter-2d";
import { Collectible2D } from "@nanoforge/scenes-2d/components/collectible-2d";
import { SceneVarText2D } from "@nanoforge/scenes-2d/components/scene-var-text-2d";
import { addToVarOnEnter2D } from "@nanoforge/scenes-2d/systems/add-to-var-on-enter-2d";
import { collect2D } from "@nanoforge/scenes-2d/systems/collect-2d";
import { showSceneVars2D } from "@nanoforge/scenes-2d/systems/show-scene-vars-2d";
import { describe, expect, it } from "vitest";

import {
  type FakeLayer,
  alive,
  fake,
  frame,
  receive,
  registry,
  run,
  spawn,
  stubDocument,
  useEcs,
} from "./helpers";

/*
 * The recipes of the packages' READMEs, end to end: the components each recipe lists, built with
 * the same constructor calls, and its systems in the order of docs/default-packages.md.
 */

useEcs();
stubDocument();

type System = Parameters<typeof registry.addSystem>[0];

/** A frame of a game at 60 frames per second, in milliseconds. */
const FRAME = 1000 / 60;

/** Adds the systems, in this order. */
const add = (...systems: System[]) => systems.forEach((system) => registry.addSystem(system));

/** Runs `count` frames of 1/60 s. */
const play = (count = 1) => {
  for (let i = 0; i < count; i++) run(frame(FRAME));
};

/** Runs frames of 1/60 s until `done()`, at most `most` of them. */
const playUntil = (done: () => boolean, most = 600) => {
  for (let i = 0; i < most && !done(); i++) play();
};

/** The bullets in the game: what `shoot2D` made from a model. */
const bullets = () => registry.getZipper([FromModel, Position2D]);

describe("recipes: controls", () => {
  it("platformer player: the arrows walk, Up does nothing, Space jumps 128 pixels once per press", () => {
    const position = new Position2D(100, 60);
    const velocity = new Velocity2D();
    const body = new RigidBody2D();
    spawn(
      position,
      velocity,
      new DrawableRect2D(20, 20),
      new HitboxRect2D(20, 20),
      body,
      new WalkAndJump2D(),
      new KeyboardControls2D(),
    );
    spawn(new Position2D(0, 100), new HitboxRect2D(800, 20), new StaticBody2D());
    // The vertical speed walkAndJump2D leaves each frame, and the highest the player went.
    const speeds: number[] = [];
    let top = Infinity;
    add(
      readKeyboard2D,
      walkAndJump2D,
      () => {
        speeds.push(velocity.y);
      },
      applyGravity2D,
      move2D,
      detectCollisions2D,
      blockOnStaticBodies2D,
      () => {
        top = Math.min(top, position.y);
      },
      draw2D,
    );

    play(30);
    expect(position.y).toBe(80);
    expect(body.grounded).toBe(true);

    fake.keys = new Set([InputEnum.ArrowRight, InputEnum.ArrowUp]);
    play();
    expect(velocity.x).toBe(200);
    expect(position.x).toBeCloseTo(100 + 200 / 60);
    expect(position.y).toBe(80);

    // Space held through the jump and the landing: one jump.
    const jump = -Math.sqrt(2 * 980 * 128);
    top = Infinity;
    fake.keys = new Set([InputEnum.Space]);
    play(90);
    expect(speeds.filter((speed) => speed === jump)).toHaveLength(1);
    expect(80 - top).toBeGreaterThan(120);
    expect(80 - top).toBeLessThanOrEqual(128);
    expect(position.y).toBe(80);
    expect(body.grounded).toBe(true);

    fake.keys = new Set();
    play();
    fake.keys = new Set([InputEnum.Space]);
    play();
    expect(speeds.filter((speed) => speed === jump)).toHaveLength(2);
  });

  it("top-down hero: a diagonal walks at its speed, and a wall stops it while it slides along", () => {
    const position = new Position2D(100, 100);
    const velocity = new Velocity2D();
    spawn(
      position,
      velocity,
      new DrawableRect2D(20, 20),
      new HitboxRect2D(20, 20),
      new WalkAndJump2D(),
      new KeyboardControls2D(),
    );
    spawn(new Position2D(130, 0), new HitboxRect2D(20, 400), new StaticBody2D());
    add(readKeyboard2D, walkAndJump2D, move2D, detectCollisions2D, blockOnStaticBodies2D, draw2D);
    fake.keys = new Set([InputEnum.ArrowRight, InputEnum.ArrowDown]);

    play();
    expect(Math.hypot(velocity.x, velocity.y)).toBeCloseTo(200);
    expect(velocity.x).toBeCloseTo(velocity.y);

    play(29);
    expect(position.x).toBe(110);
    expect(position.y).toBeCloseTo(100 + (30 * 200) / Math.SQRT2 / 60);

    fake.keys = new Set();
    play();
    expect(velocity).toMatchObject({ x: 0, y: 0 });
  });

  it("gamepad player: the left stick or the D-pad walks, the right stick aims and the trigger fires", () => {
    const position = new Position2D(0, 0);
    const velocity = new Velocity2D();
    spawn(
      position,
      velocity,
      new DrawableRect2D(20, 20),
      new HitboxRect2D(20, 20),
      new WalkAndJump2D(),
      new Shoot2D(),
      new GamepadControls2D(),
    );
    add(
      readGamepad2D,
      walkAndJump2D,
      shoot2D,
      showBullets2D,
      move2D,
      detectCollisions2D,
      blockOnStaticBodies2D,
      applyDamage2D,
      destroyOnHit2D,
      draw2D,
      expireLifetimes,
    );

    fake.sticks.left = { x: 0.5, y: 0 };
    play();
    expect(velocity).toMatchObject({ x: 100, y: 0 });
    expect(position.x).toBeCloseTo(100 / 60);

    fake.sticks.left = { x: 0, y: 0 };
    fake.buttons = new Set([ControllerButton.DPadDown]);
    play();
    expect(velocity).toMatchObject({ x: 0, y: 200 });

    fake.buttons = new Set([ControllerButton.RightTrigger]);
    fake.sticks.right = { x: 0, y: -1 };
    play();
    expect(velocity).toMatchObject({ x: 0, y: 0 });
    const [bullet] = registry.getZipper([FromModel, Velocity2D, DrawableCircle2D]);
    expect(bullet.Velocity2D).toMatchObject({ x: 0, y: -600 });
    expect(bullet.DrawableCircle2D).toMatchObject({ radius: 5, fillColor: "#cccccc" });
  });

  it("top-down shooter: the mouse aims in the world, and bullets copy the model's hitbox and look", () => {
    const hitbox = new HitboxCircle2D(3, 10, 3);
    const look = new DrawableRect2D(20, 6);
    spawn(new Tag("bullet"), new Model(), look, hitbox, new FaceVelocity2D());
    spawn(
      new Position2D(100, 100),
      new Velocity2D(),
      new DrawableRect2D(40, 40),
      new HitboxRect2D(40, 40),
      new Tag("player"),
      new WalkAndJump2D(),
      new Shoot2D(false, 3, 1, 0, "enemy"),
      new KeyboardControls2D(InputEnum.KeyA, InputEnum.KeyD, InputEnum.KeyW, InputEnum.KeyS),
    );
    add(
      click2D,
      readKeyboard2D,
      walkAndJump2D,
      shoot2D,
      showBullets2D,
      move2D,
      detectCollisions2D,
      blockOnStaticBodies2D,
      applyDamage2D,
      destroyOnHit2D,
      faceVelocity2D,
      faceAim2D,
      draw2D,
      expireLifetimes,
    );
    // The camera moved the world 100 pixels to the left: the cursor, at (320, 520) on the screen,
    // is at (420, 520) in the world, 300 pixels right of and 400 below the hitbox's middle.
    fake.baseLayer.position({ x: -100, y: 0 });
    fake.mouse = { x: 320, y: 520 };
    fake.keys = new Set([InputEnum.MouseLeft]);

    play();

    const [bullet] = registry.getZipper([
      FromModel,
      Position2D,
      Velocity2D,
      HitboxCircle2D,
      DrawableRect2D,
    ]);
    expect(bullets()).toHaveLength(1);
    expect(bullet.FromModel.model).toBe("bullet");
    expect(bullet.Velocity2D.x).toBeCloseTo(360);
    expect(bullet.Velocity2D.y).toBeCloseTo(480);
    // Copies of the model's: the hitbox with collisions of its own, the drawable with its shape.
    expect(bullet.HitboxCircle2D).not.toBe(hitbox);
    expect(bullet.HitboxCircle2D).toMatchObject({ radius: 3, offsetX: 10, offsetY: 3 });
    expect(bullet.HitboxCircle2D.collisions).not.toBe(hitbox.collisions);
    expect(bullet.DrawableRect2D).not.toBe(look);
    expect(bullet.DrawableRect2D).toMatchObject({ width: 20, height: 6 });
    // It left the hitbox's middle, (120, 120), and moved one frame: the circle's center and the
    // drawable's middle (its shape's position, as it turns around it) are both there.
    const middle = { x: 120 + 360 / 60, y: 120 + 480 / 60 };
    expect(bullet.Position2D.x + hitbox.offsetX).toBeCloseTo(middle.x);
    expect(bullet.Position2D.y + hitbox.offsetY).toBeCloseTo(middle.y);
    expect(bullet.DrawableRect2D.shape?.x()).toBeCloseTo(middle.x);
    expect(bullet.DrawableRect2D.shape?.y()).toBeCloseTo(middle.y);
    // Its FaceVelocity2D turned it toward where it flies; the model stays as it was written.
    expect(bullet.DrawableRect2D.rotation).toBeCloseTo((Math.atan2(480, 360) * 180) / Math.PI);
    expect(look).toMatchObject({ rotation: 0, shape: undefined });
    expect(hitbox.collisions).toEqual([]);
  });

  it("menu button: a click on a Clickable2D doesn't fire the player's Shoot2D, one elsewhere does", () => {
    const drawable = new DrawableRect2D(100, 50);
    const button = new Clickable2D();
    spawn(new Position2D(0, 0), drawable, button, new ColorOnHover2D(), new Hud2D());
    spawn(
      new Position2D(400, 300),
      new HitboxRect2D(20, 20),
      new Shoot2D(),
      new KeyboardControls2D(),
    );
    add(click2D, readKeyboard2D, shoot2D, colorOnHover2D, draw2D);
    fake.mouse = { x: 10, y: 10 };
    // A click is the frame the button goes down: it was up the frame before.
    play();
    fake.keys = new Set([InputEnum.MouseLeft]);

    play();
    expect(button.clicked).toBe(true);
    expect(drawable.shape?.fill()).toBe("#7cc0ff");
    expect(bullets()).toHaveLength(0);

    // The press that clicked the button never fires, even dragged off it.
    fake.mouse = { x: 300, y: 300 };
    play();
    expect(button.hovered).toBe(false);
    expect(drawable.shape?.fill()).toBe("#4aa3ff");
    expect(bullets()).toHaveLength(0);

    // A new click, elsewhere, does.
    fake.keys = new Set();
    play();
    fake.keys = new Set([InputEnum.MouseLeft]);
    play();
    expect(button.clicked).toBe(false);
    expect(bullets()).toHaveLength(1);
  });

  it("a hero walking right while the mouse aims left looks left, mirrored, over its walk", () => {
    const look = new DrawableRect2D(40, 40);
    spawn(
      new Position2D(100, 100),
      new Velocity2D(),
      look,
      new HitboxRect2D(40, 40),
      new SpriteAnimation2D(),
      new MoveAnimation2D(),
      new WalkAndJump2D(),
      new Shoot2D(),
      new KeyboardControls2D(),
      new FaceAim2D("right", true),
    );
    add(readKeyboard2D, walkAndJump2D, move2D, animateMoves2D, faceAim2D, animateSprites2D, draw2D);
    fake.keys = new Set([InputEnum.ArrowRight]);
    fake.mouse = { x: 0, y: 120, deltaX: -5 };

    play();

    // animateMoves2D mirrored it to the right first; faceAim2D, after it, wins.
    expect(look.flipX).toBe(true);
    expect(look.rotation).toBeCloseTo(0);
    expect(look.cropY).toBe(32);
  });

  it("a hero facing the mouse: FaceTarget2D looks at a FollowMouse2D cursor, under a camera", () => {
    const look = new DrawableRect2D(20, 20);
    spawn(new Position2D(100, 100), look, new FaceTarget2D("cursor"));
    spawn(new Position2D(), new DrawableCircle2D(4), new FollowMouse2D(), new Tag("cursor"));
    add(followMouse2D, faceTarget2D, draw2D);
    // The camera moved the world 100 pixels to the left: the cursor is right below the hero.
    fake.baseLayer.position({ x: -100, y: 0 });
    fake.mouse = { x: 10, y: 210 };

    play();

    expect(look.rotation).toBeCloseTo(90);
  });

  it("drag2D carries the shape draw2D drew on top: a circle over a rectangle", () => {
    fake.baseLayer = new Layer() as FakeLayer;
    const round = new Position2D(50, 50);
    const square = new Position2D(30, 30);
    spawn(round, new DrawableCircle2D(25), new Draggable2D());
    spawn(square, new DrawableRect2D(40, 40), new Draggable2D());
    add(drag2D, draw2D);
    // draw2D draws the rectangles, then the circles over them.
    play();
    fake.drag = { active: true, button: InputEnum.MouseLeft, startX: 50, startY: 50, x: 70, y: 60 };

    play();

    expect(round).toMatchObject({ x: 70, y: 60 });
    expect(square).toMatchObject({ x: 30, y: 30 });
  });

  it("mute button: a click mutes the music through setMuted, and a MuteOnKey toggles it back", () => {
    const button = new Clickable2D();
    spawn(new Position2D(0, 0), new DrawableRect2D(40, 40), button, new Hud2D());
    spawn(new MuteOnKey(InputEnum.KeyM, "music"));
    // The game's system, after click2D.
    const muteButton: System = (_registry, ctx) => {
      if (button.clicked) setMuted("music", ctx.music, !isMuted("music"));
    };
    add(click2D, muteMusicOnKey, muteButton);
    const muted = isMuted("music");
    fake.mouse = { x: 10, y: 10 };
    play();

    fake.keys = new Set([InputEnum.MouseLeft]);
    play();
    expect(isMuted("music")).toBe(!muted);
    expect(fake.music.mute).toHaveBeenCalledOnce();

    fake.keys = new Set([InputEnum.KeyM]);
    play();
    expect(isMuted("music")).toBe(muted);
    expect(fake.music.mute).toHaveBeenCalledTimes(2);
  });
});

describe("recipes: combat", () => {
  it("turret: it fires at the player, whose health drops, and its bullets pass other enemies", () => {
    spawn(
      new Position2D(0, 0),
      new DrawableRect2D(20, 20),
      new HitboxRect2D(20, 20),
      new Tag("enemy"),
      new Shoot2D(false, 1, 1, 0, "player"),
      new ShootAtNearest2D(),
      new Health(50),
    );
    const bystander = new Health(30);
    const other = spawn(
      new Position2D(100, 0),
      new HitboxRect2D(20, 20),
      new Tag("enemy"),
      bystander,
    );
    const player = new Health(100);
    spawn(new Position2D(200, 0), new HitboxRect2D(20, 20), new Tag("player"), player);
    add(
      shootAtNearest2D,
      shoot2D,
      showBullets2D,
      move2D,
      detectCollisions2D,
      applyDamage2D,
      destroyOnHit2D,
      faceAim2D,
      draw2D,
      expireLifetimes,
    );

    play(30);

    expect(player.current).toBe(90);
    expect(bystander.current).toBe(30);
    expect(alive(Health, other)).toBe(true);
    expect(bullets()).toHaveLength(0);
  });

  it("enemy that chases the player: a wall stops it, then it walks to the player and hurts it", () => {
    const player = new Health(100);
    spawn(new Position2D(300, 0), new HitboxRect2D(20, 20), new Tag("player"), player);
    const enemy = new Position2D(0, 0);
    spawn(
      enemy,
      new Velocity2D(),
      new DrawableRect2D(20, 20),
      new HitboxRect2D(20, 20),
      new Tag("enemy"),
      new WalkAndJump2D(100),
      new ChaseNearest2D(),
      new DamageOnHit2D(10, "player"),
      new Health(30),
    );
    const wall = spawn(new Position2D(150, -100), new HitboxRect2D(20, 220), new StaticBody2D());
    add(
      chaseNearest2D,
      walkAndJump2D,
      move2D,
      detectCollisions2D,
      blockOnStaticBodies2D,
      applyDamage2D,
    );

    play(180);
    expect(enemy.x).toBe(130);
    expect(player.current).toBe(100);

    registry.killEntity(wall);
    playUntil(() => player.current < 100);
    expect(player.current).toBe(90);
    // Once a second while they touch.
    play(30);
    expect(player.current).toBe(90);
    play(60);
    expect(player.current).toBe(80);
  });

  it("health pack: it heals the player by 20, up to its max, then goes; an enemy can't take it", () => {
    const player = new Position2D(200, 0);
    const health = new Health(100);
    health.current = 90;
    spawn(player, new HitboxRect2D(20, 20), new Tag("player"), health);
    const enemy = new Health(50);
    spawn(new Position2D(10, 10), new HitboxRect2D(20, 20), new Tag("enemy"), enemy);
    const pack = spawn(
      new Position2D(10, 10),
      new DrawableRect2D(10, 10),
      new HitboxRect2D(10, 10),
      new DamageOnHit2D(-20, "player"),
      new DestroyOnHit2D(false, "player"),
    );
    add(detectCollisions2D, applyDamage2D, destroyOnHit2D);

    play();
    expect(alive(DamageOnHit2D, pack)).toBe(true);
    expect(enemy.current).toBe(50);

    player.x = 0;
    play();
    expect(health.current).toBe(100);
    expect(alive(DamageOnHit2D, pack)).toBe(false);
  });

  it("animated bullets: a copy of the model's SpriteAnimation2D plays, the model's stays", () => {
    const animation = new SpriteAnimation2D(16, 16, 4, 0, 8);
    const look = new DrawableRect2D(16, 16);
    spawn(new Tag("bullet"), new Model(), look, animation, new HitboxCircle2D(8, 8, 8));
    spawn(new Position2D(0, 0), new HitboxRect2D(20, 20), new Shoot2D(true, 1));
    add(shoot2D, showBullets2D, move2D, animateSprites2D, draw2D, expireLifetimes);

    // 19 frames of 1/60 s after the shot, at 8 frames per second: its third frame.
    play(20);

    const [bullet] = registry.getZipper([FromModel, SpriteAnimation2D, DrawableRect2D]);
    expect(bullets()).toHaveLength(1);
    expect(bullet.SpriteAnimation2D).not.toBe(animation);
    expect(bullet.SpriteAnimation2D.frame).toBe(2);
    expect(bullet.DrawableRect2D.cropX).toBe(32);
    expect(animation.frame).toBe(0);
    expect(look).toMatchObject({ cropX: 0, cropWidth: 0 });
  });

  it("range 0 bullets: a Bounds2D in destroy mode on the model removes each one off the area", () => {
    const bounds = new Bounds2D(0, 0, 800, 600, "destroy");
    const model = spawn(new Tag("bullet"), new Model(), bounds);
    spawn(
      new Position2D(700, 290),
      new HitboxRect2D(20, 20),
      new Shoot2D(true, 1, 1, 0, "", 600, 10, 0),
    );
    add(
      shoot2D,
      showBullets2D,
      move2D,
      keepInBounds2D,
      detectCollisions2D,
      applyDamage2D,
      destroyOnHit2D,
      draw2D,
      expireLifetimes,
    );

    play();
    const [bullet] = registry.getZipper([FromModel, Bounds2D, HitboxCircle2D]);
    expect(bullet.Bounds2D).not.toBe(bounds);
    expect(bullet.Bounds2D).toMatchObject({ areaWidth: 800, areaHeight: 600, mode: "destroy" });
    expect(bullet.HitboxCircle2D.radius).toBe(5);
    expect(registry.getZipper([FromModel, Lifetime])).toHaveLength(0);

    // From x 710 at 10 pixels a frame, its bounding square is out past 800 on the tenth frame.
    play(14);
    expect(bullets()).toHaveLength(0);
    expect(alive(Model, model)).toBe(true);
  });

  it("HUD health bar: drawHealthBars2D shows the player's health on draw2D's HUD layer", () => {
    const health = new Health(100);
    health.current = 25;
    spawn(new Position2D(300, 300), new HitboxRect2D(20, 20), new Tag("player"), health);
    const bar = new HealthBar2D(200, 16, 0, "#5ec26a", "#3a3a3a", "player");
    spawn(new Position2D(20, 20), new Hud2D(), bar);
    const score = new DrawableText2D("Score");
    spawn(new Position2D(20, 50), new Hud2D(), score);
    add(draw2D, drawHealthBars2D);

    play();

    expect(bar.back?.getParent()).toBe(score.shape?.getParent());
    expect(bar.fill?.getAttrs()).toMatchObject({ x: 20, y: 20, width: 50, height: 16 });
  });
});

describe("recipes: paddle games and scenes", () => {
  it("pong: two paddles on one keyboard, each stopped by a wall", () => {
    const left = new Position2D(20, 250);
    const right = new Position2D(760, 250);
    spawn(
      left,
      new Velocity2D(),
      new HitboxRect2D(20, 100),
      new DeflectOnHit2D("right"),
      new WalkAndJump2D(1000, "vertical"),
      new KeyboardControls2D(
        InputEnum.ArrowLeft,
        InputEnum.ArrowRight,
        InputEnum.KeyW,
        InputEnum.KeyS,
      ),
    );
    spawn(
      right,
      new Velocity2D(),
      new HitboxRect2D(20, 100),
      new DeflectOnHit2D("left"),
      new WalkAndJump2D(1000, "vertical"),
      new KeyboardControls2D(),
    );
    spawn(new Position2D(0, -20), new HitboxRect2D(800, 20), new StaticBody2D());
    spawn(new Position2D(0, 600), new HitboxRect2D(800, 20), new StaticBody2D());
    add(readKeyboard2D, walkAndJump2D, move2D, detectCollisions2D, blockOnStaticBodies2D);
    fake.keys = new Set([InputEnum.KeyW, InputEnum.ArrowDown]);

    play(60);

    expect(left).toMatchObject({ x: 20, y: 0 });
    expect(right).toMatchObject({ x: 760, y: 500 });
  });

  it("pong: the ball leaves a paddle at an angle, bounces off the floor, and a goal counts once", () => {
    fake.vars.set("leftScore", 0);
    const ball = new Position2D(400, 330);
    const velocity = new Velocity2D(-1000, 0);
    spawn(
      ball,
      velocity,
      new DrawableCircle2D(15),
      new HitboxCircle2D(15),
      new RigidBody2D(0, 1),
      new Tag("ball"),
    );
    // The left paddle's middle is at y 300: the ball hits it 30 pixels lower, 3/5 of the way to
    // its end.
    spawn(
      new Position2D(20, 250),
      new Velocity2D(),
      new HitboxRect2D(20, 100),
      new DeflectOnHit2D("right"),
    );
    spawn(new Position2D(0, -20), new HitboxRect2D(800, 20), new StaticBody2D());
    spawn(new Position2D(0, 600), new HitboxRect2D(800, 20), new StaticBody2D());
    spawn(
      new Position2D(800, 0),
      new HitboxRect2D(20, 600),
      new AddToVarOnEnter2D("leftScore", 1, "ball"),
    );
    const leftText = new DrawableText2D();
    spawn(new Position2D(300, 20), leftText, new SceneVarText2D("leftScore"));
    let lowest = -Infinity;
    add(
      move2D,
      detectCollisions2D,
      blockOnStaticBodies2D,
      () => {
        lowest = Math.max(lowest, ball.y);
      },
      deflectOnHit2D,
      addToVarOnEnter2D,
      showSceneVars2D,
      draw2D,
    );

    playUntil(() => velocity.x > 0);
    // 3/5 of maxAngle (60 degrees) below the right.
    expect(velocity.x).toBeCloseTo(1000 * Math.cos(Math.PI / 5));
    expect(velocity.y).toBeCloseTo(1000 * Math.sin(Math.PI / 5));

    playUntil(() => fake.vars.get("leftScore") === 1);
    // The floor stopped its bounding square, and sent it back up.
    expect(lowest).toBeCloseTo(585);
    // Through the goal and gone: it counted once. Putting it back is game code.
    play(30);
    expect(fake.vars.get("leftScore")).toBe(1);
    expect(leftText.text).toBe("1");
  });

  it("breakout: a brick bounces the ball, gives 10 points and goes; the floor takes one life", () => {
    fake.vars.set("lives", 3);
    fake.vars.set("score", 0);
    const ball = new Position2D(100, 300);
    // 400 pixels per second, 30 degrees right of up.
    const velocity = new Velocity2D(200, -400 * Math.cos(Math.PI / 6));
    spawn(
      ball,
      velocity,
      new DrawableCircle2D(10),
      new HitboxCircle2D(10),
      new RigidBody2D(0, 1),
      new Tag("ball"),
    );
    spawn(
      new Position2D(600, 470),
      new Velocity2D(),
      new DrawableRect2D(100, 10),
      new HitboxRect2D(100, 10),
      new DeflectOnHit2D(),
      new WalkAndJump2D(600, "horizontal"),
      new KeyboardControls2D(),
    );
    const brick = spawn(
      new Position2D(0, 100),
      new HitboxRect2D(400, 20),
      new DrawableRect2D(400, 20),
      new StaticBody2D(),
      new Collectible2D("score", 10, "ball"),
    );
    spawn(
      new Position2D(0, 500),
      new HitboxRect2D(800, 20),
      new AddToVarOnEnter2D("lives", -1, "ball"),
    );
    const lives = new DrawableText2D();
    spawn(new Position2D(10, 10), lives, new SceneVarText2D("lives", "Lives {}"));
    const score = new DrawableText2D();
    spawn(new Position2D(10, 40), score, new SceneVarText2D("score", "Score {}"));
    add(
      readKeyboard2D,
      walkAndJump2D,
      move2D,
      detectCollisions2D,
      blockOnStaticBodies2D,
      deflectOnHit2D,
      addToVarOnEnter2D,
      collect2D,
      showSceneVars2D,
      draw2D,
    );

    playUntil(() => !alive(StaticBody2D, brick));
    // The frame the brick went, the ball had bounced off it already.
    expect(velocity.y).toBeGreaterThan(0);
    expect(fake.vars.get("score")).toBe(10);

    playUntil(() => fake.vars.get("lives") !== 3);
    // Through the floor and gone: one life only. Putting it back is game code.
    play(30);
    expect(fake.vars.get("lives")).toBe(2);
    expect(lives.text).toBe("Lives 2");
    expect(score.text).toBe("Score 10");
  });

  it("coin with a score text: the player picks the coin up, and the HUD text shows it", () => {
    fake.vars.set("score", 0);
    const player = new Position2D(200, 0);
    spawn(player, new HitboxRect2D(20, 20), new Tag("player"));
    const coin = spawn(
      new Position2D(10, 10),
      new DrawableCircle2D(5),
      new HitboxCircle2D(5),
      new Collectible2D(),
    );
    const text = new DrawableText2D();
    spawn(new Position2D(20, 20), new Hud2D(), text, new SceneVarText2D("score", "Score {}"));
    add(detectCollisions2D, collect2D, showSceneVars2D, draw2D);

    play();
    expect(text.shape?.text()).toBe("Score 0");

    player.x = 0;
    play();
    expect(alive(Collectible2D, coin)).toBe(false);
    expect(text.shape?.text()).toBe("Score 1");
  });

  it("floating +10: it rises and fades over its Lifetime, and expireLifetimes removes it", () => {
    const position = new Position2D(100, 100);
    const text = new DrawableText2D("+10");
    const entity = spawn(position, text, new Velocity2D(0, -40), new Lifetime(1), new FadeOut2D());
    add(move2D, fadeOut2D, draw2D, expireLifetimes);

    play(30);
    expect(position.y).toBeCloseTo(80);
    expect(text.opacity).toBeCloseTo(0.5, 1);
    expect(alive(Lifetime, entity)).toBe(true);

    play(40);
    expect(alive(Lifetime, entity)).toBe(false);
    expect(text.shape).toBeUndefined();
  });
});

describe("recipes: multiplayer (movement only)", () => {
  it("client: the replica catches up, the camera follows it, stays while it is parked, glides back", () => {
    const keyboard = new KeyboardControls2D();
    const id = new NetworkId(1);
    const look = new DrawableRect2D(20, 20);
    const replica = spawn(
      new Position2D(0, 0),
      new Velocity2D(),
      look,
      new HitboxRect2D(20, 20),
      id,
      keyboard,
      new Tag("me"),
    );
    spawn(new Camera2D(1, 0.1, 0, 0, 0, 0, "me"));
    add(readKeyboard2D, syncFromServer2D, move2D, followCamera2D, draw2D);
    fake.keys = new Set([InputEnum.ArrowRight, InputEnum.Space]);

    play();
    // Without a WalkAndJump2D, what the keys say stays on the device, for the game's sender.
    expect(keyboard).toMatchObject({ moveX: 1, moveY: 0, jump: true });
    expect(fake.network.sentToServer).toEqual([
      { packet: SyncRequestPacket.name, data: undefined },
    ]);

    // The server's catch-up.
    receive(Sync2DPacket, { move: { id: 1, x: 590, y: 290, velocityX: 0, velocityY: 0 } });
    receive(Sync2DPacket, { present: [1] });
    play();
    fake.network.received.length = 0;
    expect(id.synced).toBe(true);
    play(120);
    expect(fake.baseLayer.at.x).toBeCloseTo(-200);

    // Removed on the server: parked, undrawn, and the view stays where it is.
    receive(Sync2DPacket, { remove: 1 });
    play();
    fake.network.received.length = 0;
    play(30);
    expect(alive(Position2D, replica)).toBe(false);
    expect(look.shape).toBeUndefined();
    expect(fake.baseLayer.at.x).toBeCloseTo(-200);

    // Back with its next move (a respawn): the view glides toward it, from where it stayed.
    receive(Sync2DPacket, { move: { id: 1, x: 190, y: 290, velocityX: 0, velocityY: 0 } });
    play();
    fake.network.received.length = 0;
    expect(registry.getEntityComponent(replica, Position2D)).toMatchObject({ x: 190, y: 290 });
    expect(look.shape).toBeDefined();
    expect(fake.baseLayer.at.x).toBeGreaterThan(-200);
    expect(fake.baseLayer.at.x).toBeLessThan(0);
  });

  it("server: a handler latches one shot, which kills an enemy; the moves and the removal go out", () => {
    const walker = new WalkAndJump2D();
    const shoot = new Shoot2D(false, 3, 1, 0, "enemy");
    spawn(
      new Position2D(0, 0),
      new Velocity2D(),
      new HitboxRect2D(20, 20),
      walker,
      shoot,
      new NetworkId(1),
    );
    const enemy = spawn(
      new Position2D(100, 0),
      new HitboxRect2D(20, 20),
      new Tag("enemy"),
      new Health(10),
      new NetworkId(2),
    );
    // The game's packet handler, with what the seat's client sent this tick: a press is latched.
    let received = [{ moveY: 1, fire: true }];
    const handler: System = () => {
      for (const intent of received) {
        walker.moveY = intent.moveY;
        if (intent.fire) shoot.fireRequested = true;
      }
      received = [];
    };
    add(
      handler,
      walkAndJump2D,
      shoot2D,
      move2D,
      detectCollisions2D,
      blockOnStaticBodies2D,
      applyDamage2D,
      destroyOnHit2D,
      expireLifetimes,
      syncToClients2D,
    );

    play(30);

    // One bullet, which hit the enemy: a second one would still be flying.
    expect(alive(Health, enemy)).toBe(false);
    expect(bullets()).toHaveLength(0);
    expect(fake.network.sent[0]).toMatchObject({ move: { id: 1, velocityX: 0, velocityY: 200 } });
    expect(fake.network.sent).toContainEqual({ remove: 2 });
  });
});

describe("recipes: 3D", () => {
  it("a cube, a ball, a light and a camera: the cube rises, lit by the sun, seen from the camera", () => {
    const graphics = { scene: new Scene(), camera: new PerspectiveCamera() };
    const ctx = { app: { delta: FRAME }, graphics } as unknown as Context;
    spawn(new Box3D(1, 1, 1, "#44aa88"), new Position3D(-1, 0, 0), new Velocity3D(0, 0.5, 0));
    spawn(new Sphere3D(0.5, "#ff6b6b"), new Position3D(1, 0, 0));
    spawn(new Light3D("directional", "#ffffff", 3), new Position3D(3, 5, 4));
    spawn(new Camera3D(), new Position3D(0, 1, 6));
    add(move3D, draw3D);

    for (let i = 0; i < 60; i++) run(ctx);

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
