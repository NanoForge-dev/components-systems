import { type EditorComponentManifest } from "@nanoforge-dev/ecs-lib";

export class Acceleration2D {
  name = this.constructor.name;

  constructor(
    public x: number,
    public y: number,
  ) {}
}

// * Required to generate code
export default Acceleration2D.name;

// * Required for the editor to display the component and generate code
export const EDITOR_COMPONENT_MANIFEST: EditorComponentManifest = {
  name: "Acceleration2D",
  description:
    "Acceleration of an entity in a 2 dimensional space in pixels per second per seconds (px/s²)",
  params: [
    {
      type: "number",
      name: "x",
      description: "Horizontal acceleration in px/s²",
      example: 4.2,
      default: 0,
      optional: true,
    },
    {
      type: "number",
      name: "y",
      description: "Vertical acceleration in px/s²",
      example: 67,
      default: 0,
      optional: true,
    },
  ],
};
