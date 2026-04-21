import { type Context } from "@nanoforge-dev/common";
import { type EditorSystemManifest, type Registry } from "@nanoforge-dev/ecs-lib";

import { Position2D } from "../components/nf-position-2d.component";
import { Velocity2D } from "../components/nf-velocity-2d.component";

export function move2D(registry: Registry, ctx: Context) {
  const entities = registry.getZipper([Position2D, Velocity2D]);

  entities.forEach(({ Position2D, Velocity2D }) => {
    Position2D.x += (Velocity2D.x * ctx.app.delta) / 1000;
    Position2D.y += (Velocity2D.y * ctx.app.delta) / 1000;
  });
}
// * Required to generate code
export default move2D.name;

// * Required for the editor to display the system and generate code
export const EDITOR_SYSTEM_MANIFEST: EditorSystemManifest = {
  name: "move2D",
  description:
    "Move entities of their velocity in a 2 dimensional space based on time elapsed since last frame",
  dependencies: ["Position2D", "Velocity2D"],
};
