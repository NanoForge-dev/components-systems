import { type EditorComponentManifest } from "@nanoforge-dev/ecs-lib";

export class Velocity2D {
  name = this.constructor.name;

  constructor(
    public x: number,
    public y: number,
  ) {}
}

// * Required to generate code
export default Velocity2D.name;

// * Required for the editor to display the component and generate code
export const EDITOR_COMPONENT_MANIFEST: EditorComponentManifest = {
  name: "Velocity2D",
  description: "Velocity of an entity in a 2 dimensional space in pixels per second (px/s)",
  params: [
    {
      type: "number",
      name: "x",
      description: "Horizontal velocity in px/s",
      example: 4.2,
      default: 0,
      optional: true,
    },
    {
      type: "number",
      name: "y",
      description: "Vertical velocity in px/s",
      example: 67,
      default: 0,
      optional: true,
    },
  ],
};
