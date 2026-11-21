import type { Context } from "@nanoforge-dev/common";
import { Layer } from "@nanoforge-dev/graphics-2d";
import { Lifetime } from "@nanoforge/basics-2d/components/lifetime";
import { Model } from "@nanoforge/basics-2d/components/model";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { Tag } from "@nanoforge/basics-2d/components/tag";
import { Velocity2D } from "@nanoforge/basics-2d/components/velocity-2d";
import { expireLifetimes } from "@nanoforge/basics-2d/systems/expire-lifetimes";
import { Camera2D } from "@nanoforge/graphics-2d/components/camera-2d";
import { DrawableCircle2D } from "@nanoforge/graphics-2d/components/drawable-circle-2d";
import { DrawableRect2D } from "@nanoforge/graphics-2d/components/drawable-rect-2d";
import { DrawableText2D } from "@nanoforge/graphics-2d/components/drawable-text-2d";
import { FaceTarget2D } from "@nanoforge/graphics-2d/components/face-target-2d";
import { FaceVelocity2D } from "@nanoforge/graphics-2d/components/face-velocity-2d";
import { FadeOut2D } from "@nanoforge/graphics-2d/components/fade-out-2d";
import { Hud2D } from "@nanoforge/graphics-2d/components/hud-2d";
import { MoveAnimation2D } from "@nanoforge/graphics-2d/components/move-animation-2d";
import { ScrollLoop2D } from "@nanoforge/graphics-2d/components/scroll-loop-2d";
import { SpriteAnimation2D } from "@nanoforge/graphics-2d/components/sprite-animation-2d";
import { containsPoint, topmost } from "@nanoforge/graphics-2d/drawable-of";
import { faceToward } from "@nanoforge/graphics-2d/face-toward";
import { layerFor } from "@nanoforge/graphics-2d/hud-layer";
import { imageFill } from "@nanoforge/graphics-2d/image-fill";
import { animateMoves2D } from "@nanoforge/graphics-2d/systems/animate-moves-2d";
import { animateSprites2D } from "@nanoforge/graphics-2d/systems/animate-sprites-2d";
import { draw2D } from "@nanoforge/graphics-2d/systems/draw-2d";
import { faceTarget2D } from "@nanoforge/graphics-2d/systems/face-target-2d";
import { faceVelocity2D } from "@nanoforge/graphics-2d/systems/face-velocity-2d";
import { fadeOut2D } from "@nanoforge/graphics-2d/systems/fade-out-2d";
import { followCamera2D } from "@nanoforge/graphics-2d/systems/follow-camera-2d";
import { scrollLoop2D } from "@nanoforge/graphics-2d/systems/scroll-loop-2d";
import { toWorld } from "@nanoforge/graphics-2d/world";
import { describe, expect, it, vi } from "vitest";

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
const images = stubDocument();

describe("imageFill", () => {
  it("fills with the color without an image", () => {
    expect(imageFill(assets, "", 10, 10)).toMatchObject({ fillPriority: "color" });
  });

  it("stretches the image found in the assets over the shape, once per path", () => {
    const fill = imageFill(assets, "/hero.png", 200, 200);
    imageFill(assets, "/hero.png", 200, 200);

    expect(images).toHaveLength(1);
    expect(images[0]!.src).toBe("blob:/hero.png");
    expect(fill).toMatchObject({
      fillPriority: "pattern",
      fillPatternScaleX: 2,
      fillPatternScaleY: 4,
      fillPatternOffsetX: 0,
    });
    expect(imageFill(assets, "/hero.png", 100, 50, true)).toMatchObject({
      fillPatternOffsetX: 50,
      fillPatternOffsetY: 25,
    });
  });

  it("shows only the crop of the image, or tiles it at its own size", () => {
    const crop = { x: 10, y: 5, width: 20, height: 10 };

    expect(imageFill(assets, "/sheet.png", 40, 20, false, { crop })).toMatchObject({
      fillPatternScaleX: 2,
      fillPatternScaleY: 2,
      fillPatternOffsetX: 10,
      fillPatternOffsetY: 5,
    });
    expect(
      imageFill(assets, "/sheet.png", 40, 20, false, { crop: { ...crop, width: 0 } }),
    ).toMatchObject({ fillPatternScaleX: 0.4, fillPatternOffsetX: 0 });
    expect(imageFill(assets, "/sheet.png", 400, 20, false, { repeat: true })).toMatchObject({
      fillPatternRepeat: "repeat",
      fillPatternScaleX: 1,
    });
  });

  it("keeps the color when there is no asset at the path, or until it is loaded", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(imageFill(assets, "/missing.png", 10, 10)).toMatchObject({ fillPriority: "color" });
    expect(warn).toHaveBeenCalledOnce();

    vi.stubGlobal("document", {
      createElement: () => ({ src: "", naturalWidth: 0, naturalHeight: 0 }),
    });
    expect(imageFill(assets, "/loading.png", 10, 10)).toMatchObject({ fillPriority: "color" });
  });
});

describe("drawables", () => {
  it("make their shape on the first draw and keep it up to date", () => {
    const layer = fakeLayer();
    const rect = new DrawableRect2D(30, 40, "red");

    rect.draw(layer, new Position2D(1, 2), assets);
    const shape = rect.shape;
    rect.width = 60;
    rect.draw(layer, new Position2D(5, 6), assets);

    expect(rect.shape).toBe(shape);
    // It turns around its center by default: the shape's x and y are the center.
    expect(rect.shape?.getAttrs()).toMatchObject({
      x: 35,
      y: 26,
      offsetX: 30,
      offsetY: 20,
      width: 60,
      height: 40,
      fill: "red",
    });
  });

  it("draw circles at their center and texts with their text", () => {
    const layer = fakeLayer();
    const circle = new DrawableCircle2D(10, "blue");
    const text = new DrawableText2D("Score: 3", 12);

    circle.draw(layer, new Position2D(50, 50), assets);
    text.draw(layer, new Position2D(0, 0));

    expect(circle.shape?.getAttrs()).toMatchObject({ x: 50, y: 50, radius: 10, fill: "blue" });
    expect(text.shape?.getAttrs()).toMatchObject({ text: "Score: 3", fontSize: 12 });
  });

  it("turn around their center, mirror in place, and crop their image", () => {
    const rect = new DrawableRect2D(40, 20, "red", "/sheet.png");
    rect.flipX = true;
    Object.assign(rect, { cropX: 10, cropY: 5, cropWidth: 20, cropHeight: 10 });

    rect.draw(fakeLayer(), new Position2D(100, 50), assets);
    expect(rect.shape?.getAttrs()).toMatchObject({
      x: 120,
      y: 60,
      offsetX: 20,
      offsetY: 10,
      scaleX: -1,
      fillPatternScaleX: 2,
      fillPatternOffsetX: 10,
    });

    rect.rotateAroundCenter = false;
    rect.draw(fakeLayer(), new Position2D(100, 50), assets);
    expect(rect.shape?.getAttrs()).toMatchObject({ x: 140, y: 50, offsetX: 0, scaleX: -1 });
  });

  it("lose their shape when destroyed", () => {
    const text = new DrawableText2D();
    text.draw(fakeLayer(), new Position2D());

    text.destroy();

    expect(text.shape).toBeUndefined();
  });
});

describe("draw2D", () => {
  it("draws every drawable on the base layer, and removes those no longer in the world", () => {
    const layer = fakeLayer();
    const ctx = { graphics: { baseLayer: layer }, assets } as unknown as Context;
    const rect = new DrawableRect2D();
    const circle = new DrawableCircle2D();
    const text = new DrawableText2D();
    const killed = registry.spawnEntity();
    registry.addComponent(killed, new Position2D(3, 4));
    registry.addComponent(killed, rect);
    const kept = registry.spawnEntity();
    registry.addComponent(kept, new Position2D());
    registry.addComponent(kept, circle);
    registry.addComponent(kept, text);
    registry.addSystem(draw2D);

    registry.runSystems(ctx);
    expect(layer.shapes).toHaveLength(3);
    expect(rect.shape?.getAttrs()).toMatchObject({ x: 28, y: 29 });

    registry.killEntity(killed);
    registry.runSystems(ctx);
    expect(rect.shape).toBeUndefined();
    expect(circle.shape).toBeDefined();
    expect(text.shape).toBeDefined();
  });
});

describe("draw2D with Hud2D", () => {
  it("draws Hud2D entities on a layer of their own, made once, over the world", () => {
    const base = fakeLayer();
    const layers: unknown[] = [];
    const ctx = {
      graphics: { baseLayer: base, stage: { add: (layer: unknown) => layers.push(layer) } },
      assets,
    } as unknown as Context;
    const score = new DrawableText2D("0");
    const ground = new DrawableRect2D();
    spawn(new Position2D(), score, new Hud2D());
    spawn(new Position2D(), ground);
    registry.addSystem(draw2D);

    registry.runSystems(ctx);
    registry.runSystems(ctx);

    expect(layers).toHaveLength(1);
    expect(score.shape?.getParent()).toBe(layers[0]);
    expect(base.shapes).toContain(ground.shape);
    expect(base.shapes).not.toContain(score.shape);
  });
});

describe("graphics-2d", () => {
  it("animateSprites2D crops each frame in turn, and starts a new row at its first frame", () => {
    const rect = new DrawableRect2D(32, 32);
    const animation = new SpriteAnimation2D(16, 8, 3, 1, 10);
    spawn(rect, animation);
    registry.addSystem(animateSprites2D);

    run(frame(0));
    expect(rect).toMatchObject({ cropX: 0, cropY: 8, cropWidth: 16, cropHeight: 8 });

    run(frame(250));
    expect(animation.frame).toBe(2);
    expect(rect.cropX).toBe(32);
    run(frame(100));
    expect(animation.frame).toBe(0);

    animation.row = 2;
    run(frame(100));
    expect(animation.frame).toBe(0);
    expect(rect.cropY).toBe(16);
  });

  it("animateSprites2D stops on the last frame without a loop", () => {
    const animation = new SpriteAnimation2D(16, 16, 4, 0, 10, false);
    spawn(new DrawableRect2D(), animation);
    registry.addSystem(animateSprites2D);

    run(frame(0));
    run(frame(2000));

    expect(animation.frame).toBe(3);
  });

  it("animateSprites2D plays each row's own frame count from rowFrames", () => {
    const animation = new SpriteAnimation2D(16, 16, 4, 1, 8, true, "4, 8");
    spawn(new DrawableRect2D(), animation);
    registry.addSystem(animateSprites2D);

    run(frame(0));
    run(frame(875));
    expect(animation.frame).toBe(7);
    run(frame(125));
    expect(animation.frame).toBe(0);

    animation.row = 0;
    run(frame(0));
    run(frame(875));
    expect(animation.frame).toBe(3);

    // A row rowFrames doesn't list has `frames`.
    animation.row = 2;
    run(frame(0));
    run(frame(625));
    expect(animation.frame).toBe(1);
  });

  it("animateSprites2D leaves a Model's crop alone", () => {
    const rect = new DrawableRect2D();
    const animation = new SpriteAnimation2D(16, 16, 4, 1);
    spawn(new Model(), new Tag("bullet"), rect, animation);
    registry.addSystem(animateSprites2D);

    run(frame(0));
    run(frame(500));

    expect(rect).toMatchObject({ cropX: 0, cropY: 0, cropWidth: 0, cropHeight: 0 });
    expect(animation).toMatchObject({ frame: 0, elapsed: 0, playedRow: -1 });
  });

  it("animateMoves2D picks the row from the velocity and mirrors the sprite going left", () => {
    const velocity = new Velocity2D(-50, 0);
    const animation = new SpriteAnimation2D();
    const rect = new DrawableRect2D();
    const moves = new MoveAnimation2D(0, 1, 2);
    spawn(velocity, animation, rect, moves);
    registry.addSystem(animateMoves2D);

    run();
    expect(animation.row).toBe(1);
    expect(rect.flipX).toBe(true);

    velocity.x = 0;
    velocity.y = -300;
    run();
    expect(animation.row).toBe(2);
    expect(rect.flipX).toBe(true);

    // Falling shows the jump row, or the fall row once it is set.
    velocity.y = 200;
    run();
    expect(animation.row).toBe(2);
    moves.fallRow = 3;
    run();
    expect(animation.row).toBe(3);

    velocity.y = 0;
    run();
    expect(animation.row).toBe(0);
  });

  it("animateMoves2D: a fall row alone makes a side view, where going up doesn't walk", () => {
    const velocity = new Velocity2D(0, -100);
    const animation = new SpriteAnimation2D();
    spawn(velocity, animation, new DrawableRect2D(), new MoveAnimation2D(0, 1, -1, 3));
    registry.addSystem(animateMoves2D);

    run();
    expect(animation.row).toBe(0);

    velocity.y = 100;
    run();
    expect(animation.row).toBe(3);
  });

  it("animateMoves2D walks up and down in a top-down game", () => {
    const animation = new SpriteAnimation2D();
    spawn(new Velocity2D(0, 80), animation, new DrawableRect2D(), new MoveAnimation2D(0, 3));
    registry.addSystem(animateMoves2D);

    run();

    expect(animation.row).toBe(3);
  });

  it("scrollLoop2D scrolls tiles and brings each back by its width", () => {
    const first = new Position2D(0, 0);
    const second = new Position2D(100, 0);
    spawn(first, new DrawableRect2D(100, 20), new ScrollLoop2D(-60));
    spawn(second, new DrawableRect2D(100, 20), new ScrollLoop2D(-60));
    const rising = new Position2D(0, 0);
    spawn(rising, new DrawableRect2D(10, 10), new ScrollLoop2D(0, -30, 50));
    registry.addSystem(scrollLoop2D);

    run(frame(1000));
    expect(first.x).toBe(-60);
    expect(second.x).toBe(40);

    run(frame(1000));
    expect(first.x).toBeCloseTo(-20);
    expect(second.x).toBeCloseTo(80);
    expect(rising.y).toBeCloseTo(-10);
  });

  it("scrollLoop2D scrolls any entity with a span, without a DrawableRect2D", () => {
    const star = new Position2D(100, 50);
    spawn(star, new DrawableCircle2D(2), new ScrollLoop2D(-50, 0, 80));
    const credits = new Position2D(100, 600);
    spawn(credits, new DrawableText2D("Credits"), new ScrollLoop2D(0, -40, 1200));
    registry.addSystem(scrollLoop2D);
    run(frame(1000));
    expect(star.x).toBe(50);
    expect(credits.y).toBe(560);
    run(frame(1000));
    // Moved 100 px, jumped back by its 80 span.
    expect(star.x).toBeCloseTo(80);
  });

  it("fadeOut2D with a Lifetime shorter than its seconds starts opaque and fades over the whole Lifetime", () => {
    const text = new DrawableText2D("+10");
    const lifetime = new Lifetime(0.25);
    spawn(text, lifetime, new FadeOut2D());
    registry.addSystem(fadeOut2D);
    run(frame(0));
    expect(text.opacity).toBe(1);
    lifetime.left = 0.125;
    run(frame(16));
    expect(text.opacity).toBeCloseTo(0.5);
  });

  it("fadeOut2D with a Lifetime stays opaque until its last seconds, and the Lifetime removes it", () => {
    const text = new DrawableText2D("+10");
    const lifetime = new Lifetime(2);
    const floating = spawn(text, lifetime, new FadeOut2D(1));
    registry.addSystem(fadeOut2D);

    run(frame(0));
    expect(text.opacity).toBe(1);
    lifetime.left = 1;
    run(frame(16));
    expect(text.opacity).toBe(1);
    lifetime.left = 0.25;
    run(frame(16));
    expect(text.opacity).toBeCloseTo(0.25);

    // fadeOut2D never removes it: expireLifetimes does.
    registry.addSystem(expireLifetimes);
    run(frame(250));
    expect(alive(FadeOut2D, floating)).toBe(false);
  });

  it("fadeOut2D without a Lifetime leaves the entity invisible but alive, and a Model as it is", () => {
    const circle = new DrawableCircle2D(5, "red", "", 0.5);
    const kept = spawn(circle, new FadeOut2D(1));
    const model = new DrawableText2D("+10");
    const modelFade = new FadeOut2D(1);
    spawn(new Model(), new Tag("pop"), model, modelFade);
    registry.addSystem(fadeOut2D);

    run(frame(0));
    run(frame(500));
    expect(circle.opacity).toBeCloseTo(0.25);

    run(frame(600));
    expect(circle.opacity).toBe(0);
    expect(alive(FadeOut2D, kept)).toBe(true);
    expect(model.opacity).toBe(1);
    expect(modelFade).toMatchObject({ elapsed: 0, from: Number.NaN });
  });

  it("faceVelocity2D turns the drawable toward the movement, and keeps it when still", () => {
    const velocity = new Velocity2D(0, 10);
    const rect = new DrawableRect2D();
    spawn(velocity, rect, new FaceVelocity2D("down"));
    registry.addSystem(faceVelocity2D);

    run();
    expect(rect.rotation).toBe(0);

    velocity.y = 0;
    run();
    expect(rect.rotation).toBe(0);
  });

  it("faceVelocity2D turns an image drawn looking up 90 degrees more", () => {
    const circle = new DrawableCircle2D();
    spawn(new Velocity2D(10, 0), circle, new FaceVelocity2D("up"));
    registry.addSystem(faceVelocity2D);

    run();

    expect(circle.rotation).toBe(90);
  });

  it("faceVelocity2D with keepUpright mirrors a rectangle going left instead of turning it", () => {
    const rect = new DrawableRect2D();
    spawn(new Velocity2D(-10, 0), rect, new FaceVelocity2D("right", true));
    registry.addSystem(faceVelocity2D);

    run();

    expect(rect).toMatchObject({ rotation: 0, flipX: true });
  });

  it("faceTarget2D turns a rectangle drawn looking up toward the player below it", () => {
    const eyes = new DrawableRect2D();
    spawn(new Position2D(0, 0), eyes, new Tag("player"), new FaceTarget2D("player", "up"));
    // A model shares the word, without a Position2D: skipped, as is the looker's own Tag.
    spawn(new Model(), new Tag("player"), new DrawableRect2D());
    spawn(new Position2D(0, 200), new DrawableRect2D(), new Tag("player"));
    registry.addSystem(faceTarget2D);

    run();

    expect(eyes).toMatchObject({ rotation: 180, flipX: false });
  });

  it("faceTarget2D keeps the look while no entity has the tag", () => {
    const eyes = new DrawableRect2D();
    eyes.rotation = 30;
    spawn(new Position2D(), eyes, new FaceTarget2D());
    spawn(new Position2D(0, 200), new Tag("enemy"));
    registry.addSystem(faceTarget2D);

    run();

    expect(eyes.rotation).toBe(30);
  });

  it("faceTarget2D after animateMoves2D: its facing wins over the walk's mirroring", () => {
    const rect = new DrawableRect2D();
    spawn(
      new Position2D(100, 0),
      new Velocity2D(-50, 0),
      rect,
      new SpriteAnimation2D(),
      new MoveAnimation2D(),
      new FaceTarget2D("cursor"),
    );
    spawn(new Position2D(300, 25), new Tag("cursor"));
    registry.addSystem(animateMoves2D);
    registry.addSystem(faceTarget2D);

    run();

    // Walking left, looking right: neither mirrored nor upside down.
    expect(rect).toMatchObject({ rotation: 0, flipX: false });
  });

  it("followCamera2D keeps the entity in the middle, inside the world, gliding by its lag", () => {
    const player = new Position2D(500, 300);
    const camera = new Camera2D(2, 0, 0, 0, 1000, 1000);
    spawn(player, new DrawableRect2D(20, 20), camera);
    registry.addSystem(followCamera2D);

    run(frame(16));
    expect(fake.baseLayer.at).toMatchObject({ x: 400 - 510 * 2, y: 300 - 310 * 2, zoom: 2 });

    player.x = 0;
    run(frame(16));
    expect(fake.baseLayer.at.x).toBe(0);

    camera.lag = 1;
    player.x = 500;
    run(frame(1000));
    expect(fake.baseLayer.at.x).toBeCloseTo(-620 * (1 - Math.exp(-1)));
  });

  it("followCamera2D puts the world back once no entity has a camera", () => {
    const entity = spawn(new Position2D(1000, 0), new Camera2D(1, 0));
    registry.addSystem(followCamera2D);

    run();
    expect(fake.baseLayer.at.x).toBe(-600);
    registry.killEntity(entity);
    run();

    expect(fake.baseLayer.at).toMatchObject({ x: 0, y: 0, zoom: 1 });
  });

  it("followCamera2D: a camera entity follows the entity tagged target, and stays when it goes", () => {
    const camera = spawn(new Camera2D(1, 0, 0, 0, 0, 0, "player"));
    // A model shares the word, without a Position2D: skipped.
    spawn(new Model(), new Tag("player"));
    const player = spawn(new Position2D(500, 300), new Tag("player"));
    registry.addSystem(followCamera2D);

    run(frame(16));
    expect(fake.baseLayer.at).toMatchObject({ x: 400 - 500, y: 300 - 300, zoom: 1 });

    // The view is kept when the target is removed...
    registry.killEntity(player);
    run(frame(16));
    expect(fake.baseLayer.at).toMatchObject({ x: -100, y: 0 });

    // ...and goes back in place once the camera is removed.
    registry.killEntity(camera);
    run(frame(16));
    expect(fake.baseLayer.at).toMatchObject({ x: 0, y: 0, zoom: 1 });
  });

  it("followCamera2D: a camera whose target is its own Tag follows its own entity first", () => {
    spawn(new Position2D(0, 0), new Tag("player"));
    const camera = new Camera2D(1, 0, 0, 0, 0, 0, "player");
    spawn(new Position2D(1000, 300), new DrawableRect2D(20, 20), new Tag("player"), camera);
    registry.addSystem(followCamera2D);
    run(frame(16));
    expect(camera.placed).toBe(true);
    expect(fake.baseLayer.at).toMatchObject({ x: 400 - 1010, y: 300 - 310, zoom: 1 });
  });

  it("followCamera2D keeps the view through a frame with a zero-size viewport", () => {
    const camera = new Camera2D(1, 0.1);
    spawn(new Position2D(500, 300), new DrawableRect2D(20, 20), camera);
    registry.addSystem(followCamera2D);
    const saved = { ...fake.stage };
    fake.stage.scaleX = fake.stage.scaleY = fake.stage.width = fake.stage.height = () => 0;
    run(frame(16));
    expect(camera.placed).toBe(false);
    Object.assign(fake.stage, saved);
    for (let i = 0; i < 120; i++) run(frame(1000 / 60));
    expect(fake.baseLayer.at.x).toBeCloseTo(400 - 510);
    expect(fake.baseLayer.at.y).toBeCloseTo(300 - 310);
  });
});

describe("graphics-2d helpers", () => {
  it("toWorld undoes the camera, and keeps the point in an app without graphics", () => {
    fake.baseLayer.position({ x: -100, y: 0 });

    expect(toWorld(frame(), { x: 5, y: 5 })).toEqual({ x: 105, y: 5 });
    expect(toWorld(frame(16, ["graphics"]), { x: 5, y: 5 })).toEqual({ x: 5, y: 5 });
  });

  it("faceToward turns a drawable toward a direction, by the way its image looks", () => {
    const turret = new DrawableCircle2D();
    faceToward(turret, 0, 1, "right", false);
    expect(turret.rotation).toBe(90);
    faceToward(turret, 0, 0, "right", false);
    expect(turret.rotation).toBe(90);

    const eyes = new DrawableRect2D();
    faceToward(eyes, 0, 5, "up", false);
    expect(eyes).toMatchObject({ rotation: 180, flipX: false });

    const car = new DrawableRect2D();
    faceToward(car, -3, 0, "right", true);
    expect(car).toMatchObject({ rotation: 0, flipX: true });
    // Straight down, it stays mirrored.
    faceToward(car, 0, 2, "right", true);
    expect(car).toMatchObject({ rotation: -90, flipX: true });
    faceToward(car, 1, 0, "right", true);
    expect(car).toMatchObject({ rotation: 0, flipX: false });

    const fish = new DrawableRect2D();
    fish.flipX = true;
    faceToward(fish, -1, 0, "left", false);
    expect(fish).toMatchObject({ rotation: 0, flipX: false });
    faceToward(fish, 1, 0, "left", true);
    // -360 is a full turn: looking right, mirrored.
    expect(fish).toMatchObject({ rotation: -360, flipX: true });
  });

  it("containsPoint covers a visible rectangle or circle, not a text", () => {
    const rect = spawn(new DrawableRect2D(10, 20));
    const circle = spawn(new DrawableCircle2D(5));
    const hiddenRect = new DrawableRect2D(10, 20);
    hiddenRect.visible = false;
    const hidden = spawn(hiddenRect);
    const text = spawn(new DrawableText2D());
    const none = spawn();
    const at = { x: 100, y: 100 };

    expect(containsPoint(registry, rect, at, { x: 100, y: 100 })).toBe(true);
    expect(containsPoint(registry, rect, at, { x: 109.5, y: 119.5 })).toBe(true);
    expect(containsPoint(registry, rect, at, { x: 110, y: 100 })).toBe(false);
    expect(containsPoint(registry, circle, at, { x: 103, y: 104 })).toBe(true);
    expect(containsPoint(registry, circle, at, { x: 104, y: 104 })).toBe(false);
    expect(containsPoint(registry, hidden, at, at)).toBe(false);
    expect(containsPoint(registry, text, at, at)).toBe(false);
    expect(containsPoint(registry, none, at, at)).toBe(false);
  });

  it("topmost picks a Hud2D entity, then the shape drawn over, then the highest id", () => {
    const layer = new Layer();
    const under = new DrawableRect2D();
    const over = new DrawableRect2D();
    const a = spawn(new Position2D(), over);
    const b = spawn(new Position2D(), under);
    under.draw(layer, new Position2D(), assets);
    over.draw(layer, new Position2D(), assets);
    const undrawn = spawn(new Position2D(), new DrawableCircle2D());
    const later = spawn(new Position2D(), new DrawableCircle2D());
    const hud = spawn(new Position2D(), new DrawableRect2D(), new Hud2D());

    expect(topmost(registry, [b.getId(), a.getId(), undrawn.getId()])).toBe(a.getId());
    expect(topmost(registry, [later.getId(), undrawn.getId()])).toBe(later.getId());
    expect(topmost(registry, [a.getId(), hud.getId()])).toBe(hud.getId());
    expect(topmost(registry, [])).toBeUndefined();
  });

  it("layerFor puts Hud2D entities on the HUD layer, made once, and others on the world's", () => {
    const hud = spawn(new Hud2D());
    const world = spawn(new Position2D());
    const ctx = frame();

    expect(layerFor(registry, ctx, world.getId())).toBe(fake.baseLayer);
    const layer = layerFor(registry, ctx, hud.getId());
    expect(layerFor(registry, ctx, hud.getId())).toBe(layer);
    expect(fake.stage.layers).toHaveLength(1);
    expect(fake.stage.layers[0]).toBe(layer);
  });
});
