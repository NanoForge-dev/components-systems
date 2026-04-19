import { type EditorComponentManifest } from "@nanoforge-dev/ecs-lib";
import { type Layer, Text } from "@nanoforge-dev/graphics-2d";

export class DrawableText2D {
  public readonly name: string = this.constructor.name;
  shape: Text;

  constructor(
    public text: string,
    public direction?: string,
    public fontFamily?: string,
    public fontSize?: number,
    public fontStyle?: string,
    public fontVariant?: string,
    public textDecoration?: string,
    public underlineOffset?: number,
    public align?: string,
    public verticalAlign?: string,
    public padding?: number,
    public lineHeight?: number,
    public letterSpacing?: number,
    public wrap?: string,
    public ellipsis?: boolean,
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
    this.shape = new Text({
      text,
      direction,
      fontFamily,
      fontSize,
      fontStyle,
      fontVariant,
      textDecoration,
      underlineOffset,
      align,
      verticalAlign,
      padding,
      lineHeight,
      letterSpacing,
      wrap,
      ellipsis,
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
      fillPatternX: fillPatternX,
      fillPatternY: fillPatternY,
      fillPatternOffsetX: fillPatternOffsetX,
      fillPatternOffsetY: fillPatternOffsetY,
      fillPatternScaleX: fillPatternScaleX,
      fillPatternScaleY: fillPatternScaleY,
      fillPatternRotation: fillPatternRotation,
      fillPatternRepeat: fillPatternRepeat,
    });
  }

  public addToLayer(layer: Layer): void {
    if (this.shape.getParent() !== layer) layer.add(this.shape);
  }
}

// * Required to generate code
export default DrawableText2D.name;

// * Required for the editor to display the component and generate code
export const EDITOR_COMPONENT_MANIFEST: EditorComponentManifest = {
  name: "DrawableText2D",
  description: "Graphically drawable text 2D",
  params: [
    {
      name: "text",
      type: "string",
      description: "String content to render",
    },
    {
      name: "direction",
      type: "string",
      description: "Text direction. Typically 'ltr' (left-to-right) or 'rtl' (right-to-left)",
      optional: true,
    },
    {
      name: "fontFamily",
      type: "string",
      description: "Font family name (e.g. 'Arial', 'Roboto')",
      example: "Arial",
      optional: true,
    },
    {
      name: "fontSize",
      type: "number",
      description: "Font size in pixels",
      optional: true,
    },
    {
      name: "fontStyle",
      type: "string",
      description:
        "Font style such as 'normal', 'bold', 'italic', or combinations like 'bold italic'",
      optional: true,
    },
    {
      name: "fontVariant",
      type: "string",
      description: "Font variant, typically 'normal' or 'small-caps'",
      optional: true,
    },
    {
      name: "textDecoration",
      type: "string",
      description: "Text decoration such as 'underline', 'line-through', or a combination",
      optional: true,
    },
    {
      name: "underlineOffset",
      type: "number",
      description: "Vertical offset in pixels for underline or line-through decoration",
      optional: true,
    },
    {
      name: "align",
      type: "string",
      description: "Horizontal text alignment within its container: 'left', 'center', or 'right'",
      optional: true,
    },
    {
      name: "verticalAlign",
      type: "string",
      description: "Vertical alignment within the text box: 'top', 'middle', or 'bottom'",
      optional: true,
    },
    {
      name: "padding",
      type: "number",
      description: "Padding in pixels around the text inside its bounding box",
      optional: true,
    },
    {
      name: "lineHeight",
      type: "number",
      description: "Line height multiplier (e.g. 1.2 for 120% spacing between lines)",
      optional: true,
    },
    {
      name: "letterSpacing",
      type: "number",
      description: "Additional spacing between characters in pixels",
      optional: true,
    },
    {
      name: "wrap",
      type: "string",
      description: "Text wrapping mode: 'word', 'char', or 'none'",
      optional: true,
    },
    {
      name: "ellipsis",
      type: "boolean",
      description: "Whether to truncate overflowing text with an ellipsis ('...')",
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
