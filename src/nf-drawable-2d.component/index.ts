import { type EditorComponentManifest } from "@nanoforge-dev/ecs-lib";

export class Drawable2D {
  name = this.constructor.name;

  constructor(
    public width: number,
    public height: number,
  ) {}
}

// * Required to generate code
export default Drawable2D.name;

// * Required for the editor to display the component and generate code
export const EDITOR_COMPONENT_MANIFEST: EditorComponentManifest = {
  name: "Drawable2D",
  description: "Graphically drawable component",
  params: {
    x: {
      name: "x",
      type: "number",
      description: "X position of the node relative to its parent container",
      optional: true,
    },
    y: {
      name: "y",
      type: "number",
      description: "Y position of the node relative to its parent container",
      optional: true,
    },
    width: {
      name: "width",
      type: "number",
      description: "Width of the node in pixels",
      optional: true,
    },
    height: {
      name: "height",
      type: "number",
      description: "Height of the node in pixels",
      optional: true,
    },
    visible: {
      name: "visible",
      type: "boolean",
      description: "Controls whether the node is rendered",
      optional: true,
    },
    name: {
      name: "name",
      type: "string",
      description: "One or more space-separated class names for the node",
      optional: true,
    },
    opacity: {
      name: "opacity",
      type: "number",
      description: "Opacity from 0 (transparent) to 1 (fully opaque)",
      optional: true,
    },
    scaleX: {
      name: "scaleX",
      type: "number",
      description: "Horizontal scale factor",
      optional: true,
    },
    scaleY: {
      name: "scaleY",
      type: "number",
      description: "Vertical scale factor",
      optional: true,
    },
    skewX: {
      name: "skewX",
      type: "number",
      description: "Horizontal skew in radians, shears along the X axis",
      optional: true,
    },
    skewY: {
      name: "skewY",
      type: "number",
      description: "Vertical skew in radians, shears along the Y axis",
      optional: true,
    },
    rotation: {
      name: "rotation",
      type: "number",
      description:
        "Rotation angle in degrees applied around the offset point (positive values rotate clockwise)",
      optional: true,
    },
    offsetX: {
      name: "offsetX",
      type: "number",
      description: "Horizontal offset for the transform origin",
      optional: true,
    },
    offsetY: {
      name: "offsetY",
      type: "number",
      description: "Vertical offset for the transform origin",
      optional: true,
    },
    fillColor: {
      name: "fillColor",
      type: "string",
      description:
        'Solid fill color as a CSS color string (e.g. "red", "#ff0000", "rgba(255,0,0,0.5)"), or a pre-built CanvasGradient object',
      optional: true,
    },
    fillPatternImage: {
      name: "fillPatternImage",
      type: "string",
      description: "Image element to use as a tiling pattern fillt",
      optional: true,
    },
    fillPatternX: {
      name: "fillPatternX",
      type: "number",
      description:
        "Horizontal offset of the pattern origin relative to the shape's top-left corner, in pixels",
      optional: true,
    },
    fillPatternY: {
      name: "fillPatternY",
      type: "number",
      description:
        "VertHTMLImageElementical offset of the pattern origin relative to the shape's top-left corner, in pixels",
      optional: true,
    },
    fillPatternOffsetX: {
      name: "fillPatternOffsetX",
      type: "number",
      description: "Horizontally shifts the pattern image within the tile before repeating",
      optional: true,
    },
    fillPatternOffsetY: {
      name: "fillPatternOffsetY",
      type: "number",
      description: "Vertically shifts the pattern image within the tile before repeating",
      optional: true,
    },
    fillPatternScaleX: {
      name: "fillPatternScaleX",
      type: "number",
      description: "Horizontal scale factor for the pattern tile",
      optional: true,
    },
    fillPatternScaleY: {
      name: "fillPatternScaleY",
      type: "number",
      description: "Vertical scale factor for the pattern tile",
      optional: true,
    },
    fillPatternRotation: {
      name: "fillPatternRotation",
      type: "number",
      description: "Rotation of the pattern tile in degrees",
      optional: true,
    },
    fillPatternRepeat: {
      name: "fillPatternRepeat",
      type: "string",
      description:
        'Repeat mode for the pattern. One of "repeat" (default), "repeat-x", "repeat-y", or "no-repeat"',
      optional: true,
    },
  },
};
