import { InputEnum } from "@nanoforge-dev/input";

/**
 * Reacts to the mouse over its `DrawableRect2D` or `DrawableCircle2D`, for buttons and board
 * cells: `hovered` tells whether the cursor is over it, `clicked` that it was clicked this frame.
 * Only the top one under the cursor counts. Needs `Position2D` and the `click2D` system.
 *
 * @remarks
 * Add `ColorOnHover2D` to light it up. Read `clicked` from your own system, added after `click2D`.
 * It works under a `Camera2D`, and on `Hud2D` buttons.
 *
 * Only `Clickable2D` entities hide what is under them, so give a popup's background one. While one
 * is hovered, a mouse-button `fireKey` doesn't fire, and a press that clicks one doesn't fire until it
 * is released, even once the button is gone (a Play or Close button).
 *
 * @component
 * @side client
 * @group Advanced hidden - Less common settings.
 */
export class Clickable2D {
  name = "Clickable2D";

  /** Whether the cursor is over it, set by `click2D`. */
  hovered = false;
  /** Whether it was clicked this frame, set by `click2D`. */
  clicked = false;
  /**
   * Whether its button was down last frame, set by `click2D`. True at first, so a click must start
   * while it exists: a button that appears under a held click isn't clicked by it.
   */
  held = true;

  constructor(
    /** The mouse button that clicks it. @group Advanced */
    public button: InputEnum = InputEnum.MouseLeft,
  ) {}
}
