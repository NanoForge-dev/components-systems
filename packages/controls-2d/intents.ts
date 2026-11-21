import type { Entity, Registry } from "@nanoforge-dev/ecs";
import { Shoot2D } from "@nanoforge/combat-2d/components/shoot-2d";
import { WalkAndJump2D } from "@nanoforge/physics-2d/components/walk-and-jump-2d";

import type { GamepadControls2D } from "./components/gamepad-controls-2d";
import type { KeyboardControls2D } from "./components/keyboard-controls-2d";

/** What a device read this frame: where to walk, whether jump and fire are held, and an aim if it aims. */
export interface DeviceRead {
  moveX: number;
  moveY: number;
  jump: boolean;
  fire: boolean;
  aim?: { x: number; y: number };
}

/**
 * Writes what `device` read this frame into its entity's `WalkAndJump2D` and `Shoot2D`, then keeps
 * it on `device`, for `readKeyboard2D` and `readGamepad2D`. A move or a fire is written while it is
 * active and once more when it stops, so another device, an AI or the game's code drives the entity
 * the rest of the time; a fresh jump press requests a jump; an aim is written when there is one.
 */
export const writeIntents = (
  registry: Registry,
  entity: Entity,
  device: KeyboardControls2D | GamepadControls2D,
  { moveX, moveY, jump, fire, aim }: DeviceRead,
) => {
  const walker: WalkAndJump2D | undefined = registry.getEntityComponent(entity, WalkAndJump2D);
  const shooter: Shoot2D | undefined = registry.getEntityComponent(entity, Shoot2D);
  if (walker && (moveX !== 0 || moveY !== 0 || device.moveX !== 0 || device.moveY !== 0)) {
    walker.moveX = moveX;
    walker.moveY = moveY;
  }
  if (walker && jump && !device.jump) walker.jumpRequested = true;
  if (shooter && (fire || device.fire)) shooter.fire = fire;
  if (shooter && aim) Object.assign(shooter, { aimX: aim.x, aimY: aim.y });
  Object.assign(device, { moveX, moveY, jump, fire }, aim && { aimX: aim.x, aimY: aim.y });
};
