import type { EditorComponentManifest } from "@nanoforge-dev/ecs-lib";
import { InputEnum } from "@nanoforge-dev/input";

export class MoveController2D {
  name = this.constructor.name;

  constructor(
    public speedUp: number,
    public speedDown: number,
    public speedLeft: number,
    public speedRight: number,
    public keyUp: InputEnum,
    public keyDown: InputEnum,
    public keyLeft: InputEnum,
    public keyRight: InputEnum,
  ) {}
}

// * Required to generate code
export default MoveController2D.name;

// * Required for the editor to display the component and generate code
export const EDITOR_COMPONENT_MANIFEST: EditorComponentManifest = {
  name: "MoveController2D",
  description:
    "Allow control with 4 directional movement of en entity, select speed and keys to use",
  params: [
    {
      type: "number",
      name: "speedUp",
      description: "Speed going up in pixels per second",
      example: 4.2,
      default: 10,
    },
    {
      type: "number",
      name: "speedDown",
      description: "Speed going down in pixels per second",
      example: 4.2,
      default: 10,
    },
    {
      type: "number",
      name: "speedLeft",
      description: "Speed going left in pixels per second",
      example: 4.2,
      default: 10,
    },
    {
      type: "number",
      name: "speedRight",
      description: "Speed going right in pixels per second",
      example: 4.2,
      default: 10,
    },
    {
      name: "keyUp",
      type: "string",
      enum: InputEnum,
      description: "Key to press to go up",
      example: InputEnum.ArrowUp,
      default: InputEnum.ArrowUp,
    },
    {
      name: "keyDown",
      type: "string",
      enum: InputEnum,
      description: "Key to press to go down",
      example: InputEnum.ArrowDown,
      default: InputEnum.ArrowDown,
    },
    {
      name: "keyLeft",
      type: "string",
      enum: InputEnum,
      description: "Key to press to go left",
      example: InputEnum.ArrowLeft,
      default: InputEnum.ArrowLeft,
    },
    {
      name: "keyRight",
      type: "string",
      enum: InputEnum,
      description: "Key to press to go right",
      example: InputEnum.ArrowRight,
      default: InputEnum.ArrowRight,
    },
  ],
};
