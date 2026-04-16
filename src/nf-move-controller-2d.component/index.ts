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
  params: {
    speedUp: {
      type: "number",
      name: "speedUp",
      description: "Speed going up in pixels per second",
      example: 4.2,
      default: 10,
    },
    speedDown: {
      type: "number",
      name: "speedDown",
      description: "Speed going down in pixels per second",
      example: 4.2,
      default: 10,
    },
    speedLeft: {
      type: "number",
      name: "speedLeft",
      description: "Speed going left in pixels per second",
      example: 4.2,
      default: 10,
    },
    speedRight: {
      type: "number",
      name: "speedRight",
      description: "Speed going right in pixels per second",
      example: 4.2,
      default: 10,
    },
    keyUp: {
      name: "keyUp",
      type: "string",
      enum: InputEnum,
      description: "Horizontal velocity in pixels per second",
      example: InputEnum.ArrowUp,
      default: InputEnum.ArrowUp,
    },
    keyDown: {
      name: "keyDown",
      type: "string",
      enum: InputEnum,
      description: "Horizontal velocity in pixels per second",
      example: InputEnum.ArrowDown,
      default: InputEnum.ArrowDown,
    },
    keyLeft: {
      name: "keyLeft",
      type: "string",
      enum: InputEnum,
      description: "Horizontal velocity in pixels per second",
      example: InputEnum.ArrowLeft,
      default: InputEnum.ArrowLeft,
    },
    keyRight: {
      name: "keyRight",
      type: "string",
      enum: InputEnum,
      description: "Horizontal velocity in pixels per second",
      example: InputEnum.ArrowRight,
      default: InputEnum.ArrowRight,
    },
  },
};
