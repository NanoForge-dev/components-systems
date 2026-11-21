import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import "@nanoforge-dev/input";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { containsPoint, topmost } from "@nanoforge/graphics-2d/drawable-of";
import { pointFor } from "@nanoforge/graphics-2d/world";

import { Draggable2D } from "../components/draggable-2d";

/**
 * Moves the `Draggable2D` entities the mouse drags: a drag that starts on one carries it until the
 * button is released. Of the rectangles and circles under the drag's start, only the top one is
 * carried. Add it after `click2D`, before the readers and the systems that move entities.
 *
 * @system
 * @side client
 */
export const drag2D = (registry: Registry, ctx: Context) => {
  const drag = ctx.input.getDragState();
  const start = { x: drag.startX, y: drag.startY };
  const draggables = registry.getIndexedZipper([Draggable2D, Position2D]);
  const under: number[] = [];
  let carrying = false;

  draggables.forEach(({ id, Draggable2D, Position2D }) => {
    const draggable = Draggable2D as Draggable2D;
    if (!drag.active || drag.button !== draggable.button) {
      draggable.checked = false;
      draggable.grabbed = false;
      return;
    }
    if (draggable.grabbed) carrying = true;
    if (draggable.checked) return;
    // The drag just started: each entity of its button keeps where it was.
    draggable.checked = true;
    draggable.fromX = Position2D.x;
    draggable.fromY = Position2D.y;
    const at = pointFor(registry, ctx, id, start);
    if (containsPoint(registry, registry.entityFromIndex(id), Position2D, at)) under.push(id);
  });

  // Once the drag carries an entity, one spawned under its start later isn't grabbed too.
  const top = carrying ? undefined : topmost(registry, under);
  draggables.forEach(({ id, Draggable2D, Position2D }) => {
    const draggable = Draggable2D as Draggable2D;
    if (id === top) draggable.grabbed = true;
    if (!draggable.grabbed) return;
    const from = pointFor(registry, ctx, id, start);
    const now = pointFor(registry, ctx, id, { x: drag.x, y: drag.y });
    Position2D.x = draggable.fromX + now.x - from.x;
    Position2D.y = draggable.fromY + now.y - from.y;
  });
};
