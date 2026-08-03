import { type EditorComponentManifest } from "@nanoforge-dev/ecs-lib";

export class Health {
  name = this.constructor.name;

  constructor(
    public maxHealth: number,
    public currentHealth?: number,
  ) {}
}

// * Required to generate code
export default Health.name;

// * Required for the editor to display the component and generate code
export const EDITOR_COMPONENT_MANIFEST: EditorComponentManifest = {
  name: "Health",
  description: "Health of an entity",
  params: [
    {
      type: "number",
      name: "maxHealth",
      description: "Max health",
      example: 100,
      default: 100,
    },
    {
      type: "number",
      name: "currentHealth",
      description: "Current health",
      optional: true
    },
  ],
};
