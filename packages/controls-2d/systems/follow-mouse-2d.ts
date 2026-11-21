import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import "@nanoforge-dev/input";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { DrawableRect2D } from "@nanoforge/graphics-2d/components/drawable-rect-2d";
import { pointFor } from "@nanoforge/graphics-2d/world";

import { FollowMouse2D } from "../components/follow-mouse-2d";

/**
 * Moves every `FollowMouse2D` entity to the mouse cursor: the middle of its `DrawableRect2D`, or
 * its top-left corner when `centered` is off. Add it first in the frame, after the readers, before
 * the systems that read its position.
 *
 * @system
 * @side client
 */
export const followMouse2D = (registry: Registry, ctx: Context) => {
  const mouse = ctx.input.getMousePosition();

  registry
    .getIndexedZipper([FollowMouse2D, Position2D])
    .forEach(({ id, FollowMouse2D, Position2D }) => {
      const at = pointFor(registry, ctx, id as number, mouse);
      const rect: DrawableRect2D | undefined = (FollowMouse2D as FollowMouse2D).centered
        ? registry.getEntityComponent(registry.entityFromIndex(id), DrawableRect2D)
        : undefined;
      Position2D.x = at.x - (rect?.width ?? 0) / 2;
      Position2D.y = at.y - (rect?.height ?? 0) / 2;
    });
};
