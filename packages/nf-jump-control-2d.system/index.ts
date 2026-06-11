import { type Context } from "@nanoforge-dev/common";
import { type EditorSystemManifest, type Registry } from "@nanoforge-dev/ecs-lib";
import { type InputLibrary } from "@nanoforge-dev/input";

import { Acceleration2D } from "../components/nf-acceleration-2d.component";
import { JumpController2D } from "../components/nf-move-controller-2d.component";

export function jumpControl2D(registry: Registry, ctx: Context) {
  const entities = registry.getZipper([JumpController2D, Acceleration2D]);
  const input = ctx.libs.getInput<InputLibrary>();

  entities.forEach(({ JumpController2D, Acceleration2D }) => {
    if (input.isKeyPressed(JumpController2D.key)) {
      Acceleration2D.y -= JumpController2D.strength;
    }
  });
}
// * Required to generate code
export default jumpControl2D.name;

// * Required for the editor to display the system and generate code
export const EDITOR_SYSTEM_MANIFEST: EditorSystemManifest = {
  name: "jumpControl2D",
  description: "Control movable entities with 4 directional movement of en entity",
  dependencies: ["Acceleration2D", "JumpController2D"],
};
