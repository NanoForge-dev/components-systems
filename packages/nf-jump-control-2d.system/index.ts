import { type Context } from "@nanoforge-dev/common";
import { type EditorSystemManifest, type Registry } from "@nanoforge-dev/ecs-lib";
import { type InputLibrary } from "@nanoforge-dev/input";

import { JumpController2D } from "../components/nf-jump-controller-2d.component";
import { Grounded } from "../components/nf-grounded.component";
import { Velocity2D } from "../components/nf-velocity-2d.component";

export function jumpControl2D(registry: Registry, ctx: Context) {
  const entities = registry.getZipper([JumpController2D, Grounded, Velocity2D]);
  const input = ctx.libs.getInput<InputLibrary>();

  entities.forEach(({ JumpController2D, Grounded, Velocity2D }) => {
    JumpController2D.coyoteTimer -= ctx.app.delta / 1000;
    JumpController2D.bufferTimer -= ctx.app.delta / 1000;

    if (Grounded.grounded)
      JumpController2D.coyoteTimer = JumpController2D.coyoteTime;
    if (JumpController2D.coyoteTimer > 0)
      JumpController2D.remainingJumps = JumpController2D.maxJumps;

    const keyPressed = input.isKeyPressed(JumpController2D.key);

    if (keyPressed && !JumpController2D.keyPressedLastFrame)
      JumpController2D.bufferTimer = JumpController2D.jumpBuffer;
    if (JumpController2D.bufferTimer > 0 && JumpController2D.remainingJumps > 0) {
        Velocity2D.y = -JumpController2D.impulseStrength;
        JumpController2D.remainingJumps -= JumpController2D.coyoteTimer <= 0 && JumpController2D.remainingJumps == JumpController2D.maxJumps ? 2 : 1;
        JumpController2D.coyoteTimer = 0;
        JumpController2D.bufferTimer = 0;
    }
    JumpController2D.keyPressedLastFrame = keyPressed
  });
}
// * Required to generate code
export default jumpControl2D.name;

// * Required for the editor to display the system and generate code
export const EDITOR_SYSTEM_MANIFEST: EditorSystemManifest = {
  name: "jumpControl2D",
  description: "Control entities that can jump",
  dependencies: ["JumpController2D", "Grounded", "Velocity2D"],
};
