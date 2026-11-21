/**
 * Plays an animation from a sprite sheet: the `image` of the entity's `DrawableRect2D` holds the
 * frames side by side, one row per animation. Needs `DrawableRect2D` and the `animateSprites2D`
 * system.
 *
 * @remarks
 * `animateSprites2D` sets the rectangle's crop to the frame shown. Change `row` to play another
 * animation (`MoveAnimation2D` does it from the movement): it starts at its first frame. A system
 * that plays another row sets `row` after `animateMoves2D`.
 *
 * @example
 * A 4-frame walk on the second row of 32 by 32 frames: `new SpriteAnimation2D(32, 32, 4, 1)`.
 *
 * @component
 * @side client
 * @group Frames color=#e86fb0 - Where the frames are in the image.
 * @group Play color=#b18cff - How the animation plays.
 * @group Advanced hidden - Less common settings.
 */
export class SpriteAnimation2D {
  name = "SpriteAnimation2D";

  /** The frame shown, from 0, set by `animateSprites2D`. */
  frame = 0;
  /** Seconds the current row has played. */
  elapsed = 0;
  /** The row `animateSprites2D` played last frame: a new row starts at its first frame. */
  playedRow = -1;

  constructor(
    /** Width of a frame, in pixels of the image. @group Frames @preset size.width */
    public frameWidth = 32,
    /** Height of a frame, in pixels of the image. @group Frames @preset size.height */
    public frameHeight = 32,
    /** Frames in the animation, side by side on its row. @group Frames */
    public frames = 4,
    /** The row of the animation, from 0 at the top. @group Play */
    public row = 0,
    /** Frames per second. @group Play */
    public fps = 8,
    /** Whether it starts again after its last frame, or stops on it. @group Play */
    public loop = true,
    /** Frames of each row from the top when rows differ, as `4, 8, 9`; empty: `frames` for every row. @group Advanced */
    public rowFrames = "",
  ) {}
}
