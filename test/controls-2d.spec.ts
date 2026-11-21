import { Layer } from "@nanoforge-dev/graphics-2d";
import { InputEnum } from "@nanoforge-dev/input";
import { ControllerButton } from "@nanoforge-dev/input/controller";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { Shoot2D } from "@nanoforge/combat-2d/components/shoot-2d";
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
import { DrawableCircle2D } from "@nanoforge/graphics-2d/components/drawable-circle-2d";
import { DrawableRect2D } from "@nanoforge/graphics-2d/components/drawable-rect-2d";
import { Hud2D } from "@nanoforge/graphics-2d/components/hud-2d";
import { HitboxRect2D } from "@nanoforge/physics-2d/components/hitbox-rect-2d";
import { WalkAndJump2D } from "@nanoforge/physics-2d/components/walk-and-jump-2d";
import { describe, expect, it, vi } from "vitest";

import { assets, fake, frame, registry, run, spawn, stubDocument, useEcs } from "./helpers";

useEcs();
stubDocument();

const rect = (width: number, height: number) =>
  Object.assign(new DrawableRect2D(), { width, height });
const circle = (radius: number) => Object.assign(new DrawableCircle2D(), { radius });

describe("controls-2d", () => {
  it("readKeyboard2D walks with the arrows, writes 0 once on release, then leaves the move alone", () => {
    const walker = new WalkAndJump2D();
    const keyboard = new KeyboardControls2D();
    spawn(walker, keyboard);
    registry.addSystem(readKeyboard2D);
    fake.keys = new Set([InputEnum.ArrowLeft, InputEnum.ArrowDown]);

    run();
    expect(walker).toMatchObject({ moveX: -1, moveY: 1 });
    expect(keyboard).toMatchObject({ moveX: -1, moveY: 1 });

    fake.keys = new Set();
    run();
    expect(walker).toMatchObject({ moveX: 0, moveY: 0 });
    // Another device, an AI or the game's code drives it now.
    walker.moveX = 0.5;
    run();
    expect(walker.moveX).toBe(0.5);
  });

  it("readKeyboard2D requests one jump per press of Space", () => {
    const walker = new WalkAndJump2D();
    spawn(walker, new KeyboardControls2D());
    registry.addSystem(readKeyboard2D);
    fake.keys = new Set([InputEnum.Space]);

    run();
    expect(walker.jumpRequested).toBe(true);
    // walkAndJump2D clears it.
    walker.jumpRequested = false;
    run();
    expect(walker.jumpRequested).toBe(false);

    fake.keys = new Set();
    run();
    fake.keys = new Set([InputEnum.Space]);
    run();
    expect(walker.jumpRequested).toBe(true);
  });

  it("readKeyboard2D fires with the mouse toward the cursor, under a camera and on the HUD", () => {
    const world = new Shoot2D();
    const hud = new Shoot2D();
    spawn(new Position2D(100, 0), new HitboxRect2D(20, 20), world, new KeyboardControls2D());
    spawn(new Position2D(), new HitboxRect2D(20, 20), hud, new KeyboardControls2D(), new Hud2D());
    registry.addSystem(readKeyboard2D);
    // The camera moved the world 100 pixels to the left.
    fake.baseLayer.position({ x: -100, y: 0 });
    fake.mouse = { x: 50, y: 40 };
    fake.keys = new Set([InputEnum.MouseLeft]);

    run();
    // The cursor is at (150, 40) in the world and (50, 40) on the screen: 40 pixels right of and
    // 30 below the middles of the hitboxes, at (110, 10) and (10, 10).
    expect(world).toMatchObject({ fire: true, aimX: 40, aimY: 30 });
    expect(hud).toMatchObject({ fire: true, aimX: 40, aimY: 30 });

    fake.keys = new Set();
    run();
    expect(world.fire).toBe(false);
    expect(hud.fire).toBe(false);
  });

  it("readKeyboard2D leaves the aim alone until the mouse moves, then aims every frame", () => {
    const position = new Position2D(0, 0);
    const shooter = new Shoot2D();
    const keyboard = new KeyboardControls2D();
    spawn(position, shooter, keyboard);
    registry.addSystem(readKeyboard2D);
    fake.mouse = { x: 0, y: 50 };

    run();
    expect(shooter).toMatchObject({ aimX: 1, aimY: 0 });
    expect(keyboard).toMatchObject({ mouseAiming: false, aimX: 0, aimY: 0 });

    fake.mouse = { x: 0, y: 50, deltaY: 10 };
    run();
    expect(shooter).toMatchObject({ aimX: 0, aimY: 50 });

    // A still cursor over a shooter that moved.
    fake.mouse = { x: 0, y: 50 };
    position.x = 50;
    run();
    expect(shooter).toMatchObject({ aimX: -50, aimY: 50 });
    expect(keyboard).toMatchObject({ mouseAiming: true, aimX: -50, aimY: 50 });
  });

  it("readKeyboard2D keeps what it read on an entity without WalkAndJump2D or Shoot2D", () => {
    const keyboard = new KeyboardControls2D();
    spawn(new Position2D(), new HitboxRect2D(20, 20), keyboard);
    registry.addSystem(readKeyboard2D);
    fake.keys = new Set([InputEnum.ArrowRight, InputEnum.Space, InputEnum.MouseLeft]);
    fake.mouse = { x: 30, y: 10 };

    run();

    expect(keyboard).toMatchObject({
      moveX: 1,
      moveY: 0,
      jump: true,
      fire: true,
      aimX: 20,
      aimY: 0,
      mouseAiming: true,
    });
  });

  it("readKeyboard2D with aimWith moveKeys aims where the keys point, and keeps that aim", () => {
    const shooter = Object.assign(new Shoot2D(), { aimX: 0, aimY: -1 });
    spawn(
      new Position2D(),
      shooter,
      Object.assign(new KeyboardControls2D(), { aimWith: "moveKeys" as const }),
    );
    registry.addSystem(readKeyboard2D);
    fake.keys = new Set([InputEnum.ArrowRight]);
    fake.mouse = { x: 300, y: 300, deltaX: 5 };

    run();
    expect(shooter).toMatchObject({ aimX: 1, aimY: 0 });

    fake.keys = new Set();
    run();
    expect(shooter).toMatchObject({ aimX: 1, aimY: 0 });
  });

  it("readKeyboard2D doesn't fire a mouse button over a hovered Clickable2D or while dragging", () => {
    const shooter = new Shoot2D();
    const keyboard = new KeyboardControls2D();
    spawn(new Position2D(400, 400), shooter, keyboard);
    spawn(new Position2D(), rect(100, 50), new Clickable2D());
    registry.addSystem(click2D);
    registry.addSystem(readKeyboard2D);
    fake.mouse = { x: 10, y: 10 };
    fake.keys = new Set([InputEnum.MouseLeft]);

    run();
    expect(shooter.fire).toBe(false);

    fake.mouse = { x: 300, y: 300 };
    run();
    expect(shooter.fire).toBe(true);

    spawn(new Position2D(), Object.assign(new Draggable2D(), { grabbed: true }));
    run();
    expect(shooter.fire).toBe(false);

    // A key of the keyboard still fires.
    keyboard.fireKey = InputEnum.KeyF;
    fake.keys = new Set([InputEnum.KeyF]);
    run();
    expect(shooter.fire).toBe(true);
  });

  it("readKeyboard2D doesn't fire the rest of a click that closes its button", () => {
    for (const closeAtEnd of [false, true]) {
      registry.clearSystems();
      registry.clearEntities();
      fake.keys = new Set();
      const shooter = new Shoot2D();
      spawn(new Position2D(400, 300), shooter, new KeyboardControls2D());
      spawn(new Position2D(), rect(100, 50), new Clickable2D(), new Hud2D());
      const close = (r: typeof registry) =>
        r.getIndexedZipper([Clickable2D]).forEach(({ id, Clickable2D }) => {
          if (Clickable2D.clicked) r.killEntity(r.entityFromIndex(id));
        });
      registry.addSystem(click2D);
      if (!closeAtEnd) registry.addSystem(close);
      registry.addSystem(readKeyboard2D);
      if (closeAtEnd) registry.addSystem(close);
      fake.mouse = { x: 10, y: 10 };

      run(frame(16));
      fake.keys = new Set([InputEnum.MouseLeft]);
      const fires: boolean[] = [];
      for (let i = 0; i < 5; i++) {
        run(frame(16));
        fires.push(shooter.fire);
      }
      expect(fires).toEqual([false, false, false, false, false]);

      fake.keys = new Set();
      run(frame(16));
      fake.keys = new Set([InputEnum.MouseLeft]);
      run(frame(16));
      expect(shooter.fire).toBe(true);
    }
    fake.keys = new Set();
    run(frame(16));
  });

  it("readKeyboard2D doesn't fire the click that spawns the player", () => {
    let shooter: Shoot2D | undefined;
    spawn(new Position2D(), rect(100, 50), new Clickable2D(), new Hud2D());
    registry.addSystem(click2D);
    registry.addSystem((r: typeof registry) =>
      r.getIndexedZipper([Clickable2D]).forEach(({ id, Clickable2D }) => {
        if (!Clickable2D.clicked) return;
        r.killEntity(r.entityFromIndex(id));
        shooter = new Shoot2D();
        spawn(new Position2D(400, 300), shooter, new KeyboardControls2D());
      }),
    );
    registry.addSystem(readKeyboard2D);
    fake.mouse = { x: 10, y: 10 };

    run(frame(16));
    fake.keys = new Set([InputEnum.MouseLeft]);
    for (let i = 0; i < 5; i++) {
      run(frame(16));
      expect(shooter?.fire).toBe(false);
    }

    fake.keys = new Set();
    run(frame(16));
    fake.keys = new Set([InputEnum.MouseLeft]);
    run(frame(16));
    expect(shooter?.fire).toBe(true);
    fake.keys = new Set();
    run(frame(16));
  });

  it("readKeyboard2D stops a fire held from elsewhere over a button, and resumes off it", () => {
    const shooter = new Shoot2D();
    spawn(new Position2D(400, 300), shooter, new KeyboardControls2D());
    spawn(new Position2D(), rect(100, 50), new Clickable2D(), new Hud2D());
    registry.addSystem(click2D);
    registry.addSystem(readKeyboard2D);
    fake.mouse = { x: 300, y: 300 };

    run(frame(16));
    fake.keys = new Set([InputEnum.MouseLeft]);
    run(frame(16));
    expect(shooter.fire).toBe(true);
    fake.mouse = { x: 10, y: 10 };
    run(frame(16));
    expect(shooter.fire).toBe(false);
    fake.mouse = { x: 300, y: 300 };
    run(frame(16));
    expect(shooter.fire).toBe(true);
  });

  it("readKeyboard2D leaves a fire set in the editor on until the fire key is released once", () => {
    const shooter = new Shoot2D(true);
    spawn(shooter, new KeyboardControls2D());
    registry.addSystem(readKeyboard2D);

    run();
    run();
    expect(shooter.fire).toBe(true);

    fake.keys = new Set([InputEnum.MouseLeft]);
    run();
    fake.keys = new Set();
    run();
    expect(shooter.fire).toBe(false);
  });

  it("readGamepad2D walks with the left stick, writes 0 once at rest, then leaves the move alone", () => {
    const walker = Object.assign(new WalkAndJump2D(), { moveX: 0.3 });
    const pad = new GamepadControls2D();
    spawn(walker, pad);
    registry.addSystem(readGamepad2D);

    run();
    expect(walker.moveX).toBe(0.3);

    fake.sticks.left = { x: 0.5, y: -1 };
    run();
    expect(walker).toMatchObject({ moveX: 0.5, moveY: -1 });
    expect(pad).toMatchObject({ moveX: 0.5, moveY: -1 });

    fake.sticks.left = { x: 0, y: 0 };
    run();
    expect(walker).toMatchObject({ moveX: 0, moveY: 0 });
    walker.moveX = 0.3;
    run();
    expect(walker.moveX).toBe(0.3);
  });

  it("readGamepad2D walks with the D-pad while the left stick rests", () => {
    const walker = new WalkAndJump2D();
    spawn(walker, new GamepadControls2D());
    registry.addSystem(readGamepad2D);
    fake.buttons.add(ControllerButton.DPadRight);

    run();
    expect(walker).toMatchObject({ moveX: 1, moveY: 0 });

    fake.sticks.left = { x: -0.5, y: 0 };
    run();
    expect(walker.moveX).toBe(-0.5);
  });

  it("readGamepad2D jumps once per press of A and fires while the right trigger is held", () => {
    const walker = new WalkAndJump2D();
    const shooter = new Shoot2D();
    spawn(walker, shooter, new GamepadControls2D());
    registry.addSystem(readGamepad2D);
    fake.buttons = new Set([ControllerButton.A, ControllerButton.RightTrigger]);

    run();
    expect(walker.jumpRequested).toBe(true);
    expect(shooter.fire).toBe(true);

    walker.jumpRequested = false;
    run();
    expect(walker.jumpRequested).toBe(false);

    fake.buttons = new Set();
    run();
    expect(shooter.fire).toBe(false);
  });

  it("readGamepad2D aims with the right stick, and a still cursor doesn't take the aim back", () => {
    const shooter = new Shoot2D();
    const keyboard = new KeyboardControls2D();
    spawn(new Position2D(), shooter, keyboard, new GamepadControls2D());
    registry.addSystem(readKeyboard2D);
    registry.addSystem(readGamepad2D);
    fake.mouse = { x: 100, y: 0, deltaX: 10 };

    run();
    expect(shooter).toMatchObject({ aimX: 100, aimY: 0 });

    fake.mouse = { x: 100, y: 0 };
    fake.sticks.right = { x: 0, y: 1 };
    run();
    expect(shooter).toMatchObject({ aimX: 0, aimY: 1 });
    expect(keyboard.mouseAiming).toBe(false);

    fake.sticks.right = { x: 0, y: 0 };
    run();
    expect(shooter).toMatchObject({ aimX: 0, aimY: 1 });

    fake.mouse = { x: 100, y: 0, deltaX: 10 };
    run();
    expect(shooter).toMatchObject({ aimX: 100, aimY: 0 });
  });

  it("readGamepad2D with aimWith leftStick aims where it walks", () => {
    const shooter = new Shoot2D();
    spawn(shooter, Object.assign(new GamepadControls2D(), { aimWith: "leftStick" as const }));
    registry.addSystem(readGamepad2D);
    fake.buttons.add(ControllerButton.DPadUp);

    run();

    expect(shooter).toMatchObject({ aimX: 0, aimY: -1 });
  });

  it("readGamepad2D without ControllerLibrary warns once and does nothing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const walker = new WalkAndJump2D();
    spawn(walker, new GamepadControls2D());
    registry.addSystem(readGamepad2D);
    fake.sticks.left = { x: 1, y: 0 };

    run(frame(16, ["controller"]));
    run(frame(16, ["controller"]));
    const calls = warn.mock.calls.slice();
    warn.mockRestore();

    expect(walker.moveX).toBe(0);
    expect(calls).toEqual([["readGamepad2D: add ControllerLibrary to the game"]]);
  });

  it("click2D clicks the shape under the cursor once per press, and colorOnHover2D colors it", () => {
    const drawable = Object.assign(rect(100, 50), { fillColor: "#000000" });
    const button = new Clickable2D();
    spawn(new Position2D(10, 10), drawable, button, new ColorOnHover2D("#ffffff"));
    registry.addSystem(click2D);
    registry.addSystem(colorOnHover2D);
    fake.mouse = { x: 50, y: 30 };

    run();
    expect(button).toMatchObject({ hovered: true, clicked: false });
    expect(drawable.fillColor).toBe("#ffffff");

    fake.keys = new Set([InputEnum.MouseLeft]);
    run();
    expect(button.clicked).toBe(true);
    run();
    expect(button.clicked).toBe(false);

    fake.keys = new Set();
    fake.mouse = { x: 500, y: 30 };
    run();
    expect(button.hovered).toBe(false);
    expect(drawable.fillColor).toBe("#000000");
  });

  it("colorOnHover2D keeps a color set on click once the cursor leaves", () => {
    for (const markFirst of [true, false]) {
      registry.clearSystems();
      registry.clearEntities();
      fake.keys = new Set();
      const drawable = Object.assign(rect(100, 50), { fillColor: "#ffffff" });
      const button = new Clickable2D();
      spawn(new Position2D(10, 10), drawable, button, new ColorOnHover2D());
      const mark = () => {
        if (button.clicked) drawable.fillColor = "#ff0000";
      };
      registry.addSystem(click2D);
      if (markFirst) registry.addSystem(mark);
      registry.addSystem(colorOnHover2D);
      if (!markFirst) registry.addSystem(mark);
      fake.mouse = { x: 50, y: 30 };

      run();
      fake.keys = new Set([InputEnum.MouseLeft]);
      run();
      fake.keys = new Set();
      run();
      expect(drawable.fillColor).toBe("#7cc0ff");

      fake.mouse = { x: 500, y: 30 };
      run();
      expect(drawable.fillColor).toBe("#ff0000");
    }
  });

  it("click2D finds a world button under a camera, and a Hud2D button on the screen", () => {
    const world = new Clickable2D();
    const hud = new Clickable2D();
    spawn(new Position2D(100, 0), rect(10, 10), world);
    spawn(new Position2D(200, 200), rect(10, 10), hud, new Hud2D());
    registry.addSystem(click2D);
    // The camera moved the world 100 pixels to the left.
    fake.baseLayer.position({ x: -100, y: 0 });
    fake.mouse = { x: 5, y: 5 };

    run();
    expect(world.hovered).toBe(true);
    expect(hud.hovered).toBe(false);

    fake.mouse = { x: 205, y: 205 };
    run();
    expect(world.hovered).toBe(false);
    expect(hud.hovered).toBe(true);
  });

  it("click2D hovers and clicks only the Hud2D button over a world one", () => {
    const hud = new Clickable2D();
    const world = new Clickable2D();
    spawn(new Position2D(), rect(10, 10), hud, new Hud2D());
    spawn(new Position2D(100, 0), rect(10, 10), world);
    registry.addSystem(click2D);
    fake.baseLayer.position({ x: -100, y: 0 });
    fake.mouse = { x: 5, y: 5 };

    run();
    fake.keys = new Set([InputEnum.MouseLeft]);
    run();

    expect(hud).toMatchObject({ hovered: true, clicked: true });
    expect(world).toMatchObject({ hovered: false, clicked: false });
  });

  it("click2D hovers a circle button within its radius, while the window has the cursor", () => {
    const button = new Clickable2D();
    spawn(new Position2D(50, 50), circle(10), button);
    registry.addSystem(click2D);
    fake.mouse = { x: 56, y: 58 };

    run();
    expect(button.hovered).toBe(true);

    fake.mouse = { x: 58, y: 58 };
    run();
    expect(button.hovered).toBe(false);

    fake.mouse = { x: 50, y: 50, focus: false };
    run();
    expect(button.hovered).toBe(false);
  });

  it("click2D doesn't hover an invisible button, nor lets it hide the one under it", () => {
    const under = new Clickable2D();
    const hidden = new Clickable2D();
    spawn(new Position2D(), rect(50, 50), under);
    spawn(new Position2D(), Object.assign(rect(50, 50), { visible: false }), hidden);
    registry.addSystem(click2D);
    fake.mouse = { x: 10, y: 10 };

    run();

    expect(hidden.hovered).toBe(false);
    expect(under.hovered).toBe(true);
  });

  it("click2D clicks a Clickable2D with its own button only", () => {
    const button = new Clickable2D(InputEnum.MouseRight);
    spawn(new Position2D(), rect(50, 50), button);
    registry.addSystem(click2D);
    fake.mouse = { x: 10, y: 10 };

    run();
    fake.keys = new Set([InputEnum.MouseLeft]);
    run();
    expect(button.clicked).toBe(false);

    fake.keys = new Set([InputEnum.MouseRight]);
    run();
    expect(button.clicked).toBe(true);
  });

  it("click2D doesn't click a button that appears under a held click", () => {
    const button = new Clickable2D(InputEnum.MouseMiddle);
    registry.addSystem(click2D);
    fake.mouse = { x: 10, y: 10 };
    fake.keys = new Set([InputEnum.MouseMiddle]);

    run();
    spawn(new Position2D(), rect(50, 50), button);
    run();
    expect(button).toMatchObject({ hovered: true, clicked: false });

    fake.keys = new Set();
    run();
    fake.keys = new Set([InputEnum.MouseMiddle]);
    run();
    expect(button.clicked).toBe(true);
  });

  it("drag2D carries a rectangle when the drag starts on it", () => {
    const grabbed = new Position2D(0, 0);
    const missed = new Position2D(200, 200);
    spawn(grabbed, rect(50, 50), new Draggable2D());
    spawn(missed, rect(50, 50), new Draggable2D());
    registry.addSystem(drag2D);
    fake.drag = { active: true, button: InputEnum.MouseLeft, startX: 10, startY: 10, x: 40, y: 25 };

    run();
    fake.drag = { ...fake.drag, x: 60, y: 10 };
    run();
    expect(grabbed).toMatchObject({ x: 50, y: 0 });
    expect(missed).toMatchObject({ x: 200, y: 200 });

    // The next drag starts on the other one.
    fake.drag = { active: false };
    run();
    fake.drag = {
      active: true,
      button: InputEnum.MouseLeft,
      startX: 210,
      startY: 210,
      x: 220,
      y: 230,
    };
    run();
    expect(grabbed).toMatchObject({ x: 50, y: 0 });
    expect(missed).toMatchObject({ x: 210, y: 220 });
  });

  it("click2D doesn't click a button met under a click held since a scene without click2D", () => {
    const menu = spawn(new Position2D(), rect(50, 50), new Clickable2D());
    registry.addSystem(click2D);
    fake.mouse = { x: 10, y: 10 };
    run();
    run();

    // The menu scene unloads; the game scene has no click2D.
    registry.killEntity(menu);
    registry.clearSystems();
    fake.keys = new Set([InputEnum.MouseLeft]);
    run();
    run();

    const retry = new Clickable2D();
    spawn(new Position2D(), rect(50, 50), retry, new Hud2D());
    registry.addSystem(click2D);
    run();
    expect(retry).toMatchObject({ hovered: true, clicked: false });

    fake.keys = new Set();
    run();
    fake.keys = new Set([InputEnum.MouseLeft]);
    run();
    expect(retry.clicked).toBe(true);
    fake.keys = new Set();
    run();
  });

  it("drag2D doesn't grab a Draggable2D spawned under the drag's start while it carries one", () => {
    const item = new Position2D(0, 0);
    spawn(item, rect(50, 50), new Draggable2D());
    registry.addSystem(drag2D);
    fake.drag = { active: true, button: InputEnum.MouseLeft, startX: 10, startY: 10, x: 20, y: 10 };
    run();

    const refill = new Position2D(0, 0);
    const refillDrag = new Draggable2D();
    spawn(refill, rect(50, 50), refillDrag);
    fake.drag = { ...fake.drag, x: 110 };
    run();

    expect(item).toMatchObject({ x: 100 });
    expect(refill).toMatchObject({ x: 0 });
    expect(refillDrag.grabbed).toBe(false);
  });

  it("drag2D carries only the top one of two overlapping entities", () => {
    const layer = new Layer();
    const top = new Position2D(0, 0);
    const bottom = new Position2D(0, 0);
    const topRect = rect(50, 50);
    const bottomRect = rect(50, 50);
    // The top one is spawned first, so that it isn't on top by its id.
    spawn(top, topRect, new Draggable2D());
    spawn(bottom, bottomRect, new Draggable2D());
    bottomRect.draw(layer, bottom, assets);
    topRect.draw(layer, top, assets);
    registry.addSystem(drag2D);
    fake.drag = { active: true, button: InputEnum.MouseLeft, startX: 10, startY: 10, x: 30, y: 20 };

    run();

    expect(top).toMatchObject({ x: 20, y: 10 });
    expect(bottom).toMatchObject({ x: 0, y: 0 });
  });

  it("drag2D carries a circle", () => {
    const position = new Position2D(100, 100);
    spawn(position, circle(20), new Draggable2D());
    registry.addSystem(drag2D);
    fake.drag = {
      active: true,
      button: InputEnum.MouseLeft,
      startX: 110,
      startY: 100,
      x: 130,
      y: 120,
    };

    run();

    expect(position).toMatchObject({ x: 120, y: 120 });
  });

  it("followMouse2D puts a rectangle's middle on the cursor, or its corner with centered off", () => {
    const centered = new Position2D();
    const corner = new Position2D();
    spawn(centered, rect(20, 10), new FollowMouse2D());
    spawn(corner, rect(20, 10), new FollowMouse2D(false));
    registry.addSystem(followMouse2D);
    fake.mouse = { x: 0, y: 50 };

    run();

    expect(centered).toMatchObject({ x: -10, y: 45 });
    expect(corner).toMatchObject({ x: 0, y: 50 });
  });
});
