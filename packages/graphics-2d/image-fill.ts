import type { AssetContext } from "@nanoforge-dev/common";
import type { ShapeConfig } from "@nanoforge-dev/graphics-2d";

const images = new Map<string, HTMLImageElement>();

/** Options of `imageFill`. */
export interface ImageFillOptions {
  /** The part of the image shown, in its pixels: all of it while the width or height is 0. */
  crop?: { x: number; y: number; width: number; height: number };
  /** Whether the image is tiled at its own size instead of stretched over the shape. */
  repeat?: boolean;
}

/**
 * The fill of a shape of `width` by `height` pixels showing the image at `path` (an asset path
 * such as `/textures/hero.png`, found in `assets`) stretched over it. Without an image, until it
 * is loaded, or when there is no asset at `path`, the shape is filled with its color.
 *
 * @param centered - Whether the shape's origin is its center (a circle) instead of its top-left
 * corner (a rectangle).
 */
export const imageFill = (
  assets: AssetContext,
  path: string,
  width: number,
  height: number,
  centered = false,
  { crop, repeat = false }: ImageFillOptions = {},
): ShapeConfig => {
  if (!path) return { fillPriority: "color", fillPatternImage: undefined };
  let image = images.get(path);
  if (!image) {
    image = document.createElement("img");
    try {
      image.src = assets.getAsset(path).path;
    } catch (error) {
      // Once per path, not every frame: the shape keeps its color.
      console.warn(`No image at "${path}":`, error);
    }
    images.set(path, image);
  }
  if (!image.naturalWidth) return { fillPriority: "color", fillPatternImage: undefined };
  if (repeat) {
    return {
      fillPriority: "pattern",
      fillPatternImage: image,
      fillPatternRepeat: "repeat",
      fillPatternScaleX: 1,
      fillPatternScaleY: 1,
      fillPatternOffsetX: 0,
      fillPatternOffsetY: 0,
    };
  }
  const area =
    crop && crop.width > 0 && crop.height > 0
      ? crop
      : { x: 0, y: 0, width: image.naturalWidth, height: image.naturalHeight };
  return {
    fillPriority: "pattern",
    fillPatternImage: image,
    fillPatternRepeat: "no-repeat",
    fillPatternScaleX: width / area.width,
    fillPatternScaleY: height / area.height,
    fillPatternOffsetX: area.x + (centered ? area.width / 2 : 0),
    fillPatternOffsetY: area.y + (centered ? area.height / 2 : 0),
  };
};
