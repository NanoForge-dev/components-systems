import { type EditorSystemManifest, type Registry } from "@nanoforge-dev/ecs-lib";

import { Acceleration2D } from "../components/nf-acceleration-2d.component";

const GRAVITY_STRENGTH = 1;

export function gravity2D(registry: Registry) {
  const entities = registry.getZipper([Acceleration2D]);

  entities.forEach(({ Acceleration2D }) => {
    Acceleration2D.y -= GRAVITY_STRENGTH;
  });
}
// * Required to generate code
export default gravity2D.name;

// * Required for the editor to display the system and generate code
export const EDITOR_SYSTEM_MANIFEST: EditorSystemManifest = {
  name: "gravity2D",
  description: "Apply a down acceleration to every object",
  dependencies: ["Acceleration2D"],
};
