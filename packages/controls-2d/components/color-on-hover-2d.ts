/**
 * Colors the drawable while the cursor is over it, and gives the color back after: a button that
 * lights up. A color your system sets meanwhile is kept. Needs `Clickable2D`, a drawable and the
 * `colorOnHover2D` system.
 *
 * @remarks
 * It changes the color, so it shows on a drawable without an image.
 *
 * @component
 * @side client
 * @group Look color=#b18cff - Its color under the cursor.
 */
export class ColorOnHover2D {
  name = "ColorOnHover2D";

  /** The drawable's color to give back when the cursor leaves, kept by `colorOnHover2D`. */
  normalColor?: string;

  constructor(
    /** A CSS color while the cursor is over it. @group Look @preset color */
    public color = "#7cc0ff",
  ) {}
}
