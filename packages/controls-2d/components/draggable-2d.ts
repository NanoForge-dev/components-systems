import { InputEnum } from "@nanoforge-dev/input";

/**
 * Lets the mouse drag the entity's `DrawableRect2D` or `DrawableCircle2D`: press a button on it,
 * move, release. For puzzles, cards and inventories. Only the top one under the cursor is dragged.
 * Needs `Position2D` and the `drag2D` system.
 *
 * @remarks
 * While it is grabbed, a mouse-button `fireKey` doesn't fire. A client-only convenience: a server
 * never sees the move.
 *
 * @component
 * @side client
 * @group Drag color=#9d7bff - How the entity is dragged.
 */
export class Draggable2D {
  name = "Draggable2D";

  /** Whether the current drag carries the entity, set by `drag2D`. */
  grabbed = false;
  /** Whether `drag2D` already looked where the current drag started. */
  checked = false;
  /** Where the entity was when the drag started, set by `drag2D`. */
  fromX = 0;
  /** See `fromX`. */
  fromY = 0;

  constructor(
    /** The mouse button that drags it. @group Drag */
    public button: InputEnum = InputEnum.MouseLeft,
  ) {}
}
