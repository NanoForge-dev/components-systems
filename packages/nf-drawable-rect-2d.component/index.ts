import { type EditorComponentManifest } from "@nanoforge-dev/ecs-lib";
import { type Layer, Rect } from "@nanoforge-dev/graphics-2d";

export class DrawableRect2D {
  public readonly name: string = this.constructor.name;
  shape: Rect;

  constructor(
    public cornerRadius?: number,
    public width?: number,
    public height?: number,
    public visible?: boolean,
    public id?: string,
    public opacity?: number,
    public scaleX?: number,
    public scaleY?: number,
    public skewX?: number,
    public skewY?: number,
    public rotation?: number,
    public offsetX?: number,
    public offsetY?: number,
    public fillColor?: string,
    public fillPatternImage?: string,
    public fillPatternX?: number,
    public fillPatternY?: number,
    public fillPatternOffsetX?: number,
    public fillPatternOffsetY?: number,
    public fillPatternScaleX?: number,
    public fillPatternScaleY?: number,
    public fillPatternRotation?: number,
    public fillPatternRepeat?: string,
  ) {
    this.shape = new Rect({
      width,
      height,
      visible,
      id,
      opacity,
      scaleX,
      scaleY,
      skewX,
      skewY,
      rotation,
      offsetX,
      offsetY,
      fill: fillColor,
      fillPatternImage: this.fillPatternImage
        ? Object.assign(new Image(), { src: this.fillPatternImage })
        : undefined,
      fillPatternX,
      fillPatternY,
      fillPatternOffsetX,
      fillPatternOffsetY,
      fillPatternScaleX,
      fillPatternScaleY,
      fillPatternRotation,
      fillPatternRepeat,
    });
  }

  public addToLayer(layer: Layer): void {
    if (this.shape.getParent() !== layer) layer.add(this.shape);
  }
}

// * Required to generate code
export default DrawableRect2D.name;

// * Required for the editor to display the component and generate code
export const EDITOR_COMPONENT_MANIFEST: EditorComponentManifest = {
  name: "DrawableRect2D",
  description: "Graphically drawable rectangle 2D",
  params: [
    {
      name: "cornerRadius",
      type: "number",
      description: "Corner radius in pixels",
      optional: true,
      default: 0,
    },
    {
      name: "width",
      type: "number",
      description: "Width of the node in pixels",
      optional: false,
      default: 10,
    },
    {
      name: "height",
      type: "number",
      description: "Height of the node in pixels",
      optional: false,
      default: 10,
    },
    {
      name: "visible",
      type: "boolean",
      description: "Controls whether the node is rendered",
      default: true,
      optional: false,
    },
    {
      name: "id",
      type: "string",
      description: "Unique identifier for the node, used with stage.findOne('#id')",
      optional: true,
    },
    {
      name: "opacity",
      type: "number",
      description: "Opacity from 0 (transparent) to 1 (fully opaque)",
      default: 1,
      optional: true,
    },
    {
      name: "scaleX",
      type: "number",
      description: "Horizontal scale factor",
      default: 1,
      optional: true,
    },
    {
      name: "scaleY",
      type: "number",
      description: "Vertical scale factor",
      default: 1,
      optional: true,
    },
    {
      name: "skewX",
      type: "number",
      default: 0,
      description: "Horizontal skew in radians, shears along the X axis",
      optional: true,
    },
    {
      name: "skewY",
      type: "number",
      default: 0,
      description: "Vertical skew in radians, shears along the Y axis",
      optional: true,
    },
    {
      name: "rotation",
      type: "number",
      description:
        "Rotation angle in degrees applied around the offset point (positive values rotate clockwise)",
      default: 0,
      optional: true,
    },
    {
      name: "offsetX",
      type: "number",
      description: "Horizontal offset for the transform origin",
      default: 0,
      optional: true,
    },
    {
      name: "offsetY",
      type: "number",
      description: "Vertical offset for the transform origin",
      default: 0,
      optional: true,
    },
    {
      name: "fillColor",
      type: "string",
      description:
        'Solid fill color as a CSS color string (e.g. "red", "#ff0000", "rgba(255,0,0,0.5)"), or a pre-built CanvasGradient object',
      default: "red",
      example: "rgb(255,255,255)",
      optional: true,
    },
    {
      name: "fillPatternImage",
      type: "string",
      description: "Image element to use as a tiling pattern fillt",
      optional: true,
    },
    {
      name: "fillPatternX",
      type: "number",
      description:
        "Horizontal offset of the pattern origin relative to the shape's top-left corner, in pixels",
      optional: true,
    },
    {
      name: "fillPatternY",
      type: "number",
      description:
        "VertHTMLImageElementical offset of the pattern origin relative to the shape's top-left corner, in pixels",
      optional: true,
    },
    {
      name: "fillPatternOffsetX",
      type: "number",
      description: "Horizontally shifts the pattern image within the tile before repeating",
      optional: true,
    },
    {
      name: "fillPatternOffsetY",
      type: "number",
      description: "Vertically shifts the pattern image within the tile before repeating",
      optional: true,
    },
    {
      name: "fillPatternScaleX",
      type: "number",
      description: "Horizontal scale factor for the pattern tile",
      optional: true,
    },
    {
      name: "fillPatternScaleY",
      type: "number",
      description: "Vertical scale factor for the pattern tile",
      optional: true,
    },
    {
      name: "fillPatternRotation",
      type: "number",
      description: "Rotation of the pattern tile in degrees",
      optional: true,
    },
    {
      name: "fillPatternRepeat",
      type: "string",
      description:
        'Repeat mode for the pattern. One of "repeat" (default), "repeat-x", "repeat-y", or "no-repeat"',
      optional: true,
    },
  ],
};
