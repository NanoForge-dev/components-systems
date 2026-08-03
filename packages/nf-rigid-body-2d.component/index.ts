import { type EditorComponentManifest } from "@nanoforge-dev/ecs-lib";

export class RigidBody2D {
  name = this.constructor.name;

  constructor(
    public gravityStrength: number,
  ) { }
}

// * Required to generate code
export default RigidBody2D.name;

// * Required for the editor to display the component and generate code
export const EDITOR_COMPONENT_MANIFEST: EditorComponentManifest = {
  name: "RigidBody2D",
  description: "Rigid body of movable object, afected by gravity, blocked by static body",
  params: [
    {
      type: "number",
      name: "gravityStrength",
      description: "Strength of the gravity (acting as down acceleration) in px/s²",
      default: 0,
    },
  ],
};
