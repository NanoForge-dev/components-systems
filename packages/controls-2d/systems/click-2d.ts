import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import "@nanoforge-dev/input";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { containsPoint, topmost } from "@nanoforge/graphics-2d/drawable-of";
import { pointFor } from "@nanoforge/graphics-2d/world";

import { forgetReleased, pressedOnClickable } from "../clicks";
import { Clickable2D } from "../components/clickable-2d";

/**
 * Sets `hovered` and `clicked` on the `Clickable2D` entities: only the top one whose rectangle or
 * circle is under the cursor is hovered, and it is clicked the frame its button goes down. Add it
 * first, before `drag2D` and the systems that read `clicked`.
 *
 * @system
 * @side client
 */
export const click2D = (registry: Registry, ctx: Context) => {
  const held = (button: Clickable2D["button"]) => ctx.input.isKeyPressed(button) === true;
  forgetReleased(held);
  const clickables = registry.getIndexedZipper([Clickable2D, Position2D]);

  const mouse = ctx.input.getMouseState();
  const over = mouse.focus
    ? clickables.filter(({ id, Position2D }) =>
        containsPoint(
          registry,
          registry.entityFromIndex(id),
          Position2D,
          pointFor(registry, ctx, id, mouse),
        ),
      )
    : [];
  const top = topmost(
    registry,
    over.map(({ id }) => id),
  );

  clickables.forEach(({ id, Clickable2D }) => {
    const click = Clickable2D as Clickable2D;
    const down = held(click.button);
    click.hovered = id === top;
    click.clicked = click.hovered && down && !click.held;
    click.held = down;
    if (click.clicked) pressedOnClickable.add(click.button);
  });
};
