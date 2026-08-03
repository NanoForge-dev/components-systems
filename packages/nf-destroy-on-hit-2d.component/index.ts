import { type EditorComponentManifest } from "@nanoforge-dev/ecs-lib";

export class DestroyOnHit2D {
  name = this.constructor.name;

  constructor(
    public destroyOnOwner: boolean,
    public destroyOnStaticBody: boolean,
  ) {}
}

// * Required to generate code
export default DestroyOnHit2D.name;

// * Required for the editor to display the component and generate code
export const EDITOR_COMPONENT_MANIFEST: EditorComponentManifest = {
  name: "DestroyOnHit2D",
  description: "Destroy the entity at collision",
  params: [
    {
      type: "boolean",
      name: "destroyOnOwner",
      description: "Should the entity destroy on hit with the owner",
      default: false,
    },
    {
      type: "boolean",
      name: "destroyOnStaticBody",
      description: "Should the entity destroy on hit with static bodys",
      default: true,
    },
  ],
};
