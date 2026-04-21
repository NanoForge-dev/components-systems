import { type Context } from "@nanoforge-dev/common";
import { type EditorSystemManifest, type Registry } from "@nanoforge-dev/ecs-lib";

import { Acceleration2D } from "../components/nf-acceleration-2d.component";
import { Velocity2D } from "../components/nf-velocity-2d.component";

export function accelerate2D(registry: Registry, ctx: Context) {
  const entities = registry.getZipper([Acceleration2D, Velocity2D]);

  entities.forEach(({ Acceleration2D, Velocity2D }) => {
    Velocity2D.x += (Acceleration2D.x * ctx.app.delta) / 1000;
    Velocity2D.y += (Acceleration2D.y * ctx.app.delta) / 1000;
  });
}
// * Required to generate code
export default accelerate2D.name;

// * Required for the editor to display the system and generate code
export const EDITOR_SYSTEM_MANIFEST: EditorSystemManifest = {
  name: "accelerate2D",
  description:
    "Accelerate entities of their acceleration in a 2 dimensional space based on time elapsed since last frame",
  dependencies: ["Acceleration2D", "Velocity2D"],
};
