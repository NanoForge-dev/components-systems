import { Entity, type EditorComponentManifest } from "@nanoforge-dev/ecs-lib";

export class HitboxCircle2D {
  name = this.constructor.name;
  public entitiesColliding: Entity[] = [];

  constructor(
    public radius: number,
  ) {}
}

// * Required to generate code
export default HitboxCircle2D.name;

// * Required for the editor to display the component and generate code
export const EDITOR_COMPONENT_MANIFEST: EditorComponentManifest = {
  name: "HitboxCircle2D",
  description: "Hitbox circle shaped in 2d",
  params: [
    {
      type: "number",
      name: "radius",
      description: "Radius of the hitbox in pixel",
      example: 4.2,
      default: 10,
    },
  ],
};
