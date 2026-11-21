import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";

import { DrawableRect2D } from "../components/drawable-rect-2d";
import { ScrollLoop2D } from "../components/scroll-loop-2d";

/**
 * Where an axis is, from `start`, after moving `moved` pixels at `speed`: within one `span` of
 * the start, on the side it scrolls toward.
 */
const loop = (start: number, moved: number, speed: number, span: number): number => {
  if (speed === 0 || span <= 0) return start + moved;
  return start + (speed < 0 ? -(-moved % span) : moved % span);
};

/**
 * Scrolls the `ScrollLoop2D` entities, each jumping back to where it started once it moved its
 * `span`. Add it before `draw2D`.
 *
 * @system
 * @side client
 */
export const scrollLoop2D = (registry: Registry, ctx: Context) => {
  const seconds = ctx.app.delta / 1000;

  const rects = registry.getComponents(DrawableRect2D);

  registry
    .getIndexedZipper([ScrollLoop2D, Position2D])
    .forEach(({ id, ScrollLoop2D, Position2D }) => {
      const scroll = ScrollLoop2D as ScrollLoop2D;
      const position = Position2D as Position2D;
      const rect = rects.get(id) as DrawableRect2D | undefined;
      if (Number.isNaN(scroll.startX)) {
        scroll.startX = position.x;
        scroll.startY = position.y;
      }

      position.x = loop(
        scroll.startX,
        position.x - scroll.startX + scroll.speedX * seconds,
        scroll.speedX,
        scroll.span || (rect?.width ?? 0),
      );
      position.y = loop(
        scroll.startY,
        position.y - scroll.startY + scroll.speedY * seconds,
        scroll.speedY,
        scroll.span || (rect?.height ?? 0),
      );
    });
};
