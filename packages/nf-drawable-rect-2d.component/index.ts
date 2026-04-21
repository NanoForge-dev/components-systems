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
    this.shape = new Rect();
    this.shape.cornerRadius(this.cornerRadius);
    if (width !== undefined) this.shape.width();
    if (height !== undefined) this.shape.height();
    if (visible !== undefined) this.shape.visible();
    if (id !== undefined) this.shape.id();
    if (opacity !== undefined) this.shape.opacity();
    if (scaleX !== undefined) this.shape.scaleX();
    if (scaleY !== undefined) this.shape.scaleY();
    if (skewX !== undefined) this.shape.skewX();
    if (skewY !== undefined) this.shape.skewY();
    if (rotation !== undefined) this.shape.rotation();
    if (offsetX !== undefined) this.shape.offsetX();
    if (offsetY !== undefined) this.shape.offsetY();
    if (fillColor !== undefined) this.shape.fill();
    if (fillPatternX !== undefined) this.shape.fillPatternX();
    if (fillPatternY !== undefined) this.shape.fillPatternY();
    if (fillPatternOffsetX !== undefined) this.shape.fillPatternOffsetX();
    if (fillPatternOffsetY !== undefined) this.shape.fillPatternOffsetY();
    if (fillPatternScaleX !== undefined) this.shape.fillPatternScaleX();
    if (fillPatternScaleY !== undefined) this.shape.fillPatternScaleY();
    if (fillPatternRotation !== undefined) this.shape.fillPatternRotation();
    if (fillPatternRepeat !== undefined) this.shape.fillPatternRepeat();
    if (fillPatternImage !== undefined)
      this.shape.fillPatternImage(
        this.fillPatternImage
          ? Object.assign(new Image(), { src: this.fillPatternImage })
          : undefined,
      );
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
    },
    {
      name: "width",
      type: "number",
      description: "Width of the node in pixels",
      optional: true,
    },
    {
      name: "height",
      type: "number",
      description: "Height of the node in pixels",
      optional: true,
    },
    {
      name: "visible",
      type: "boolean",
      description: "Controls whether the node is rendered",
      optional: true,
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
      optional: true,
    },
    {
      name: "scaleX",
      type: "number",
      description: "Horizontal scale factor",
      optional: true,
    },
    {
      name: "scaleY",
      type: "number",
      description: "Vertical scale factor",
      optional: true,
    },
    {
      name: "skewX",
      type: "number",
      description: "Horizontal skew in radians, shears along the X axis",
      optional: true,
    },
    {
      name: "skewY",
      type: "number",
      description: "Vertical skew in radians, shears along the Y axis",
      optional: true,
    },
    {
      name: "rotation",
      type: "number",
      description:
        "Rotation angle in degrees applied around the offset point (positive values rotate clockwise)",
      optional: true,
    },
    {
      name: "offsetX",
      type: "number",
      description: "Horizontal offset for the transform origin",
      optional: true,
    },
    {
      name: "offsetY",
      type: "number",
      description: "Vertical offset for the transform origin",
      optional: true,
    },
    {
      name: "fillColor",
      type: "string",
      description:
        'Solid fill color as a CSS color string (e.g. "red", "#ff0000", "rgba(255,0,0,0.5)"), or a pre-built CanvasGradient object',
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
