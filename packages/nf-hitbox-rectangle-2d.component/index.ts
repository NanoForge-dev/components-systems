import { Entity, type EditorComponentManifest } from "@nanoforge-dev/ecs-lib";

export class HitboxRectangle2D {
  name = this.constructor.name;
  public entitiesColliding: Entity[] = [];

  constructor(
    public width: number,
    public height: number,
  ) {}
}

// * Required to generate code
export default HitboxRectangle2D.name;

// * Required for the editor to display the component and generate code
export const EDITOR_COMPONENT_MANIFEST: EditorComponentManifest = {
  name: "HitboxRectangle2D",
  description: "Hitbox rectangle shaped in 2d",
  params: [
    {
      type: "number",
      name: "width",
      description: "Width of the hitbox in pixel",
      example: 4.2,
      default: 10,
    },
    {
      type: "number",
      name: "height",
      description: "Height of the hitbox in pixel",
      example: 67,
      default: 10,
    },
  ],
};
