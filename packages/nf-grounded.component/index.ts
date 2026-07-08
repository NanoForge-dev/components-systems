import { type EditorComponentManifest } from "@nanoforge-dev/ecs-lib";

export class Grounded {
  name = this.constructor.name;
  public grounded: boolean = false;

  constructor(
  ) {}
}

// * Required to generate code
export default Grounded.name;

// * Required for the editor to display the component and generate code
export const EDITOR_COMPONENT_MANIFEST: EditorComponentManifest = {
  name: "Grounded",
  description: "Hold informations about grounded status",
  params: [],
};
