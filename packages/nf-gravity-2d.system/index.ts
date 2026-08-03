import { type EditorSystemManifest, type Registry } from "@nanoforge-dev/ecs-lib";

import { Acceleration2D } from "../components/nf-acceleration-2d.component";
import { Grounded } from "../components/nf-grounded.component";
import { RigidBody2D } from "../components/nf-rigid-body-2d.component";

export function gravity2D(registry: Registry) {
  const entities = registry.getZipper([Acceleration2D, Grounded, RigidBody2D]);

  entities.forEach(({ Acceleration2D, Grounded, RigidBody2D }) => {
    if (Grounded.grounded) {
      Acceleration2D.y = 0
      return
    }
    Acceleration2D.y = RigidBody2D.gravityStrength
  });
}
// * Required to generate code
export default gravity2D.name;

// * Required for the editor to display the system and generate code
export const EDITOR_SYSTEM_MANIFEST: EditorSystemManifest = {
  name: "gravity2D",
  description: "Apply gravity acceleration to rigid bodies that are not grounded",
  dependencies: ["Acceleration2D", "Grounded", "RigidBody2D"],
};
