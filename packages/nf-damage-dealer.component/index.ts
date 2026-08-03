import { type EditorComponentManifest } from "@nanoforge-dev/ecs-lib";

export class DamageDealer {
  name = this.constructor.name;

  constructor(
    public damage: number,
  ) {}
}

// * Required to generate code
export default DamageDealer.name;

// * Required for the editor to display the component and generate code
export const EDITOR_COMPONENT_MANIFEST: EditorComponentManifest = {
  name: "DamageDealer",
  description: "Damage dealer at collision",
  params: [
    {
      type: "number",
      name: "damage",
      description: "Number of damage inflicted at collision",
      example: 10,
      default: 10,
    },
  ],
};
