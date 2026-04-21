import { type Context } from "@nanoforge-dev/common";
import { type EditorSystemManifest, type Registry } from "@nanoforge-dev/ecs-lib";
import { type InputLibrary } from "@nanoforge-dev/input";

import { MoveController2D } from "../components/nf-move-controller-2d.component";
import { Velocity2D } from "../components/nf-velocity-2d.component";

export function moveControl2D(registry: Registry, ctx: Context) {
  const entities = registry.getZipper([MoveController2D, Velocity2D]);
  const input = ctx.libs.getInput<InputLibrary>();

  entities.forEach(({ MoveController2D, Velocity2D }) => {
    const upPressed = input.isKeyPressed(MoveController2D.keyUp);
    const downPressed = input.isKeyPressed(MoveController2D.keyDown);
    const rightPressed = input.isKeyPressed(MoveController2D.keyRight);
    const leftPressed = input.isKeyPressed(MoveController2D.keyLeft);

    let velX = 0;
    if (leftPressed != rightPressed) {
      velX = rightPressed ? MoveController2D.speedRight : -MoveController2D.speedLeft;
    }
    Velocity2D.x = velX;

    let velY = 0;
    if (upPressed != downPressed) {
      velY = upPressed ? -MoveController2D.speedUp : MoveController2D.speedDown;
    }
    Velocity2D.y = velY;
  });
}
// * Required to generate code
export default moveControl2D.name;

// * Required for the editor to display the system and generate code
export const EDITOR_SYSTEM_MANIFEST: EditorSystemManifest = {
  name: "moveControl2D",
  description: "Control movable entities with 4 directional movement of en entity",
  dependencies: ["Velocity2D", "MoveController2D"],
};
