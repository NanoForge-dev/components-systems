import { Entity, type EditorComponentManifest } from "@nanoforge-dev/ecs-lib";

export class Owner {
  name = this.constructor.name;

  public owner: Entity

  constructor(
  ) { }
}

// * Required to generate code
export default Owner.name;

// * Required for the editor to display the component and generate code
export const EDITOR_COMPONENT_MANIFEST: EditorComponentManifest = {
  name: "Owner",
  description: "Store the other entity that own this one",
  params: [
  ],
};
