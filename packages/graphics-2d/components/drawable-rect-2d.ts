import type { AssetContext } from "@nanoforge-dev/common";
import { type Layer, Rect } from "@nanoforge-dev/graphics-2d";
import type { Position2D } from "@nanoforge/basics-2d/components/position-2d";

import { imageFill } from "../image-fill";

/**
 * Draws a rectangle at the entity's `Position2D` (its top-left corner). Needs the `draw2D`
 * system.
 *
 * @remarks
 * Of an `image`, the crop shows one part (a frame of a sprite sheet, a tile of a tileset).
 * `repeat` tiles the whole image at its own size instead of stretching it and ignores the crop, so
 * a `SpriteAnimation2D` on a repeat rectangle doesn't play. It turns and is mirrored around its
 * center, so it stays on its hitbox: `shape.x()` and `shape.y()` are then its center, and its
 * top-left corner is still its `Position2D`. `shape` is the Konva `Rect` on screen: change it from
 * code for anything the parameters don't offer (shadows, strokes...).
 *
 * @component
 * @side client
 * @group Shape color=#e86fb0 - Size of the rectangle.
 * @group Look color=#b18cff - What the rectangle looks like.
 * @group Crop hidden - The part of the image shown: all of it while the width or height is 0.
 * @group Advanced hidden - Less common settings.
 */
export class DrawableRect2D {
  name = "DrawableRect2D";

  /** The rectangle on screen, made by `draw2D` the first time it draws it. */
  shape?: Rect;

  constructor(
    /** In pixels. @group Shape @preset size.width */
    public width = 50,
    /** In pixels. @group Shape @preset size.height */
    public height = 50,
    /** A CSS color: `red`, `#ff0000`, `rgba(255, 0, 0, 0.5)`... @group Look @preset color */
    public fillColor = "#4aa3ff",
    /** An image stretched over the rectangle, shown instead of the color. @group Look @asset .png .jpg .jpeg .gif .webp .svg */
    public image = "",
    /** From 0 (invisible) to 1 (opaque). @group Look */
    public opacity = 1,
    /** Clockwise, in degrees, around its center (its top-left corner with `rotateAroundCenter` off). @group Advanced */
    public rotation = 0,
    /** Rounds the corners, in pixels. @group Advanced */
    public cornerRadius = 0,
    /** Whether it is drawn. @group Advanced */
    public visible = true,
    /** Whether it turns, and is mirrored, around its center instead of its top-left corner. @group Advanced */
    public rotateAroundCenter = true,
    /** Whether it is mirrored left to right, such as a character walking left. @group Advanced */
    public flipX = false,
    /** Whether the whole image is tiled at its own size instead of stretched over the rectangle; it ignores the crop. @group Look */
    public repeat = false,
    /** Pixels from the left of the image. @group Crop @preset vector.x */
    public cropX = 0,
    /** Pixels from the top of the image. @group Crop @preset vector.y */
    public cropY = 0,
    /** In pixels of the image. @group Crop @preset size.width */
    public cropWidth = 0,
    /** In pixels of the image. @group Crop @preset size.height */
    public cropHeight = 0,
  ) {}

  /** Puts the rectangle on `layer` at `position`, up to date with the parameters. */
  draw(layer: Layer, position: Position2D, assets: AssetContext): void {
    this.shape ??= new Rect();
    if (this.shape.getParent() !== layer) layer.add(this.shape);
    // Konva turns and flips a shape around its offset: the top-left corner, or the center.
    const pivotX = this.rotateAroundCenter ? this.width / 2 : 0;
    const pivotY = this.rotateAroundCenter ? this.height / 2 : 0;
    this.shape.setAttrs({
      // Mirrored around its top-left corner, it would be drawn left of its position.
      x: position.x + pivotX + (this.flipX && !this.rotateAroundCenter ? this.width : 0),
      y: position.y + pivotY,
      offsetX: pivotX,
      offsetY: pivotY,
      scaleX: this.flipX ? -1 : 1,
      width: this.width,
      height: this.height,
      fill: this.fillColor,
      opacity: this.opacity,
      rotation: this.rotation,
      cornerRadius: this.cornerRadius,
      visible: this.visible,
      ...imageFill(assets, this.image, this.width, this.height, false, {
        crop: { x: this.cropX, y: this.cropY, width: this.cropWidth, height: this.cropHeight },
        repeat: this.repeat,
      }),
    });
  }

  /** Removes the rectangle from the screen. */
  destroy(): void {
    this.shape?.destroy();
    this.shape = undefined;
  }
}
