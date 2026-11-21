/**
 * Fades the entity's drawable out. With a `Lifetime`, it is invisible when the `Lifetime` removes
 * the entity; with a `Velocity2D` going up, that makes a "+10" that floats away. Without a
 * `Lifetime`, it stays, invisible. It never removes the entity. Needs a `DrawableRect2D`,
 * `DrawableCircle2D` or `DrawableText2D`, and the `fadeOut2D` system.
 *
 * @component
 * @side client
 * @group Fade color=#b18cff - How it fades.
 */
export class FadeOut2D {
  name = "FadeOut2D";

  /** Seconds it has been fading, counted by `fadeOut2D`. */
  elapsed = 0;
  /** The drawable's opacity when it started fading, set by `fadeOut2D`. */
  from = Number.NaN;

  constructor(
    /** Seconds to become invisible: the last seconds of its `Lifetime` when it has one, all of it when shorter. @group Fade */
    public seconds = 1,
  ) {}
}
