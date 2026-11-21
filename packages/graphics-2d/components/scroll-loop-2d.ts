/**
 * Scrolls the entity endlessly: it moves, and jumps back to where it started each time it has
 * moved `span` pixels. Tiles side by side make an endless ground or background; layers at
 * different speeds make parallax. Needs `Position2D` and the `scrollLoop2D` system; a `span` of 0
 * uses its `DrawableRect2D`'s width or height.
 *
 * @example
 * Three 336-pixel ground tiles at x 0, 336 and 672, each with `new ScrollLoop2D(-150)`: each
 * jumps back by its own width. Use enough tiles to cover the screen's width plus one tile
 * (n x 336 >= width + 336): three for a screen up to 672 pixels wide. One wide rectangle
 * with a `repeat` image works too, with `span` set to the image's width.
 *
 * @component
 * @side client
 * @group Scroll color=#36c5a0 - How it scrolls.
 */
export class ScrollLoop2D {
  name = "ScrollLoop2D";

  /** Where it started, set by `scrollLoop2D` the first time. */
  startX = Number.NaN;
  /** See `startX`. */
  startY = Number.NaN;

  constructor(
    /** Pixels per second to the right; negative to the left. @group Scroll @preset vector.x */
    public speedX = -150,
    /** Pixels per second down; negative up. @group Scroll @preset vector.y */
    public speedY = 0,
    /** Pixels it moves before it jumps back: 0 for its `DrawableRect2D`'s width (or height, going up or down). @group Scroll */
    public span = 0,
  ) {}
}
