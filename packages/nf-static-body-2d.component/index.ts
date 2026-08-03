import { type EditorComponentManifest } from "@nanoforge-dev/ecs-lib";

export class StaticBody2D {
  name = this.constructor.name;

  constructor(
    public oneWay?: string,
  ) { }
}

// * Required to generate code
export default StaticBody2D.name;

// * Required for the editor to display the component and generate code
export const EDITOR_COMPONENT_MANIFEST: EditorComponentManifest = {
  name: "StaticBody2D",
  description: "Static body of immovable object (walls, grounds...)",
  params: [
    {
      name: "oneWay",
      type: "string",
      enum: [
        "up",
        "down",
        "left",
        "right"
      ],
      description: "Only traversable in one direction (platform, doors...)",
      optional: true
    },
  ],
};
