import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import { InputEnum } from "@nanoforge-dev/input";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { pointFor } from "@nanoforge/graphics-2d/world";
import { centerOf } from "@nanoforge/physics-2d/collisions";

import { forgetReleased, pressedOnClickable } from "../clicks";
import { Clickable2D } from "../components/clickable-2d";
import { Draggable2D } from "../components/draggable-2d";
import { KeyboardControls2D } from "../components/keyboard-controls-2d";
import { writeIntents } from "../intents";

/** The mouse's buttons, which `InputEnum` counts as keys. */
const mouseButtons = [
  InputEnum.MouseLeft,
  InputEnum.MouseMiddle,
  InputEnum.MouseRight,
  InputEnum.Back,
  InputEnum.Forward,
];

/**
 * Fills the intents of each `KeyboardControls2D` entity from the keys and the mouse: where its
 * `WalkAndJump2D` walks and when it jumps, when its `Shoot2D` fires and where it aims. Add it
 * first in the frame, after `click2D` and `drag2D`, before `readGamepad2D`.
 *
 * @remarks
 * A move or a fire is written while its key is held and once more when it is released, and left
 * alone the rest of the time, so a gamepad, an AI or your code can drive the entity too. The mouse
 * aims from the middle of the hitbox, every frame once the mouse moved or a mouse button was held,
 * until a gamepad stick aims. A mouse button doesn't fire while a `Clickable2D` is hovered or a
 * `Draggable2D` grabbed, and a press that clicked a `Clickable2D` doesn't fire until it is
 * released, even once the button is gone.
 *
 * @system
 * @side client
 */
export const readKeyboard2D = (registry: Registry, ctx: Context) => {
  const held = (key: InputEnum) => ctx.input.isKeyPressed(key) === true;
  forgetReleased(held);
  const mouse = ctx.input.getMouseState();
  const mouseActive = mouse.deltaX !== 0 || mouse.deltaY !== 0 || mouseButtons.some(held);
  const uiBusy =
    registry.getZipper([Clickable2D]).some(({ Clickable2D }) => Clickable2D.hovered) ||
    registry.getZipper([Draggable2D]).some(({ Draggable2D }) => Draggable2D.grabbed);

  registry.getIndexedZipper([KeyboardControls2D]).forEach(({ id, KeyboardControls2D }) => {
    const keyboard = KeyboardControls2D as KeyboardControls2D;
    const entity = registry.entityFromIndex(id);
    const moveX = Number(held(keyboard.right)) - Number(held(keyboard.left));
    const moveY = Number(held(keyboard.down)) - Number(held(keyboard.up));
    const fire =
      held(keyboard.fireKey) &&
      !(
        mouseButtons.includes(keyboard.fireKey) &&
        (uiBusy || pressedOnClickable.has(keyboard.fireKey))
      );

    let aim: { x: number; y: number } | undefined;
    if (keyboard.aimWith === "moveKeys" && (moveX !== 0 || moveY !== 0))
      aim = { x: moveX, y: moveY };
    if (keyboard.aimWith === "mouse") {
      keyboard.mouseAiming ||= mouseActive;
      const position: Position2D | undefined = registry.getEntityComponent(entity, Position2D);
      if (keyboard.mouseAiming && mouse.focus && position) {
        const cursor = pointFor(registry, ctx, id, mouse);
        const from = centerOf(registry, entity, position);
        if (cursor.x !== from.x || cursor.y !== from.y)
          aim = { x: cursor.x - from.x, y: cursor.y - from.y };
      }
    }

    writeIntents(registry, entity, keyboard, {
      moveX,
      moveY,
      jump: held(keyboard.jumpKey),
      fire,
      aim,
    });
  });
};
