import { type EditorComponentManifest } from "@nanoforge-dev/ecs-lib";
import { type Layer, Text } from "@nanoforge-dev/graphics-2d";

export class DrawableText2D {
  public readonly name: string = this.constructor.name;
  shape: Text;

  constructor(
    text?: string,
    direction?: string,
    fontFamily?: string,
    fontSize?: number,
    fontStyle?: string,
    fontVariant?: string,
    textDecoration?: string,
    underlineOffset?: number,
    align?: string,
    verticalAlign?: string,
    padding?: number,
    lineHeight?: number,
    letterSpacing?: number,
    wrap?: string,
    ellipsis?: boolean,
    width?: number,
    height?: number,
    visible?: boolean,
    id?: string,
    opacity?: number,
    scaleX?: number,
    scaleY?: number,
    skewX?: number,
    skewY?: number,
    rotation?: number,
    offsetX?: number,
    offsetY?: number,
    fillColor?: string,
    private _fillPatternImage?: string,
    fillPatternX?: number,
    fillPatternY?: number,
    fillPatternOffsetX?: number,
    fillPatternOffsetY?: number,
    fillPatternScaleX?: number,
    fillPatternScaleY?: number,
    fillPatternRotation?: number,
    fillPatternRepeat?: string,
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
      fillPatternImage: _fillPatternImage
        ? Object.assign(new Image(), { src: _fillPatternImage })
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
  get text() {
    return this.shape.text();
  }
  set text(v: string) {
    this.shape.setText(v);
  }
  get direction() {
    return this.shape.direction();
  }
  set direction(v: string) {
    this.shape.direction(v);
  }
  get fontFamily() {
    return this.shape.fontFamily();
  }
  set fontFamily(v: string) {
    this.shape.fontFamily(v);
  }
  get fontSize() {
    return this.shape.fontSize();
  }
  set fontSize(v: number) {
    this.shape.fontSize(v);
  }
  get fontStyle() {
    return this.shape.fontStyle();
  }
  set fontStyle(v: string) {
    this.shape.fontStyle(v);
  }
  get fontVariant() {
    return this.shape.fontVariant();
  }
  set fontVariant(v: string) {
    this.shape.fontVariant(v);
  }
  get textDecoration() {
    return this.shape.textDecoration();
  }
  set textDecoration(v: string) {
    this.shape.textDecoration(v);
  }
  get underlineOffset() {
    return this.shape.underlineOffset();
  }
  set underlineOffset(v: number) {
    this.shape.underlineOffset(v);
  }
  get align() {
    return this.shape.align();
  }
  set align(v: string) {
    this.shape.align(v);
  }
  get verticalAlign() {
    return this.shape.verticalAlign();
  }
  set verticalAlign(v: string) {
    this.shape.verticalAlign(v);
  }
  get padding() {
    return this.shape.padding();
  }
  set padding(v: number) {
    this.shape.padding(v);
  }
  get lineHeight() {
    return this.shape.lineHeight();
  }
  set lineHeight(v: number) {
    this.shape.lineHeight(v);
  }
  get letterSpacing() {
    return this.shape.letterSpacing();
  }
  set letterSpacing(v: number) {
    this.shape.letterSpacing(v);
  }
  get wrap() {
    return this.shape.wrap();
  }
  set wrap(v: string) {
    this.shape.wrap(v);
  }
  get ellipsis() {
    return this.shape.ellipsis();
  }
  set ellipsis(v: boolean) {
    this.shape.ellipsis(v);
  }
  get width() {
    return this.shape.width();
  }
  set width(v: number) {
    this.shape.width(v);
    this.redraw();
  }
  get height() {
    return this.shape.height();
  }
  set height(v: number) {
    this.shape.height(v);
    this.redraw();
  }
  get visible() {
    return this.shape.visible();
  }
  set visible(v: boolean) {
    this.shape.visible(v);
    this.redraw();
  }
  get id() {
    return this.shape.id();
  }
  set id(v: string) {
    this.shape.id(v);
    this.redraw();
  }
  get opacity() {
    return this.shape.opacity();
  }
  set opacity(v: number) {
    this.shape.opacity(v);
    this.redraw();
  }
  get scaleX() {
    return this.shape.scaleX();
  }
  set scaleX(v: number) {
    this.shape.scaleX(v);
    this.redraw();
  }
  get scaleY() {
    return this.shape.scaleY();
  }
  set scaleY(v: number) {
    this.shape.scaleY(v);
    this.redraw();
  }
  get skewX() {
    return this.shape.skewX();
  }
  set skewX(v: number) {
    this.shape.skewX(v);
    this.redraw();
  }
  get skewY() {
    return this.shape.skewY();
  }
  set skewY(v: number) {
    this.shape.skewY(v);
    this.redraw();
  }
  get rotation() {
    return this.shape.rotation();
  }
  set rotation(v: number) {
    this.shape.rotation(v);
    this.redraw();
  }
  get offsetX() {
    return this.shape.offsetX();
  }
  set offsetX(v: number) {
    this.shape.offsetX(v);
    this.redraw();
  }
  get offsetY() {
    return this.shape.offsetY();
  }
  set offsetY(v: number) {
    this.shape.offsetY(v);
    this.redraw();
  }
  get fillColor() {
    return this.shape.fill().toString();
  }
  set fillColor(v: string) {
    this.shape.fill(v);
    this.redraw();
  }
  get fillPatternImage(): string {
    return this._fillPatternImage || "";
  }
  set fillPatternImage(v: string) {
    this.shape.fillPatternImage(v ? Object.assign(new Image(), { src: v }) : undefined);
    this.redraw();
  }
  get fillPatternX() {
    return this.shape.fillPatternX();
  }
  set fillPatternX(v: number) {
    this.shape.fillPatternX(v);
    this.redraw();
  }
  get fillPatternY() {
    return this.shape.fillPatternY();
  }
  set fillPatternY(v: number) {
    this.shape.fillPatternY(v);
    this.redraw();
  }
  get fillPatternOffsetX() {
    return this.shape.fillPatternOffsetX();
  }
  set fillPatternOffsetX(v: number) {
    this.shape.fillPatternOffsetX(v);
    this.redraw();
  }
  get fillPatternOffsetY() {
    return this.shape.fillPatternOffsetY();
  }
  set fillPatternOffsetY(v: number) {
    this.shape.fillPatternOffsetY(v);
    this.redraw();
  }
  get fillPatternScaleX() {
    return this.shape.fillPatternScaleX();
  }
  set fillPatternScaleX(v: number) {
    this.shape.fillPatternScaleX(v);
    this.redraw();
  }
  get fillPatternScaleY() {
    return this.shape.fillPatternScaleY();
  }
  set fillPatternScaleY(v: number) {
    this.shape.fillPatternScaleY(v);
    this.redraw();
  }
  get fillPatternRotation() {
    return this.shape.fillPatternRotation();
  }
  set fillPatternRotation(v: number) {
    this.shape.fillPatternRotation(v);
    this.redraw();
  }
  get fillPatternRepeat() {
    return this.shape.fillPatternRepeat();
  }
  set fillPatternRepeat(v: string) {
    this.shape.fillPatternRepeat(v);
    this.redraw();
  }

  public addToLayer(layer: Layer): void {
    if (this.shape.getParent() !== layer) layer.add(this.shape);
  }

  private redraw() {
    this.shape.getLayer()?.batchDraw();
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
      optional: false,
      default: "Hello World !",
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
      optional: false,
      default: 12,
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
      description: "Width of the text box in pixels",
      optional: true,
    },
    {
      name: "height",
      type: "number",
      description: "Height of the text box in pixels",
      optional: true,
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
