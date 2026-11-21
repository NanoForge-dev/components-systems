import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import { ControllerButton } from "@nanoforge-dev/input/controller";

import { GamepadControls2D } from "../components/gamepad-controls-2d";
import { KeyboardControls2D } from "../components/keyboard-controls-2d";
import { writeIntents } from "../intents";

/** Whether the missing `ControllerLibrary` was already reported. */
let warned = false;

/**
 * Fills the intents of each `GamepadControls2D` entity from its gamepad: where its `WalkAndJump2D`
 * walks and when it jumps, when its `Shoot2D` fires and where it aims. Add it after
 * `readKeyboard2D`, so that a pushed stick wins over the keys and the mouse.
 *
 * @remarks
 * The D-pad walks while the left stick rests. A move or a fire is written while active and once
 * more when it stops; an aim is written while its stick is pushed, and stays when it rests. Needs
 * the game's `ControllerLibrary`: without it, it warns once and does nothing.
 *
 * @system
 * @side client
 */
export const readGamepad2D = (registry: Registry, ctx: Context) => {
  const controller = ctx.controller;
  if (!controller) {
    if (!warned) console.warn("readGamepad2D: add ControllerLibrary to the game");
    warned = true;
    return;
  }

  registry.getIndexedZipper([GamepadControls2D]).forEach(({ id, GamepadControls2D }) => {
    const pad = GamepadControls2D as GamepadControls2D;
    const entity = registry.entityFromIndex(id);
    const held = (button: ControllerButton) => controller.isButtonPressed(button, pad.gamepad);
    let { x, y } = controller.getStick("left", pad.gamepad);
    if (x === 0 && y === 0) {
      x = Number(held(ControllerButton.DPadRight)) - Number(held(ControllerButton.DPadLeft));
      y = Number(held(ControllerButton.DPadDown)) - Number(held(ControllerButton.DPadUp));
    }

    const stick =
      pad.aimWith === "rightStick"
        ? controller.getStick("right", pad.gamepad)
        : pad.aimWith === "leftStick"
          ? { x, y }
          : undefined;
    const aim = stick && (stick.x !== 0 || stick.y !== 0) ? stick : undefined;
    const keyboard: KeyboardControls2D | undefined = registry.getEntityComponent(
      entity,
      KeyboardControls2D,
    );
    if (aim && keyboard) keyboard.mouseAiming = false;

    writeIntents(registry, entity, pad, {
      moveX: x,
      moveY: y,
      jump: held(pad.jumpButton),
      fire: held(pad.fireButton),
      aim,
    });
  });
};
