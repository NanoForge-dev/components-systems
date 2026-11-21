import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import "@nanoforge-dev/graphics-2d";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { taggedIds } from "@nanoforge/basics-2d/tags";

import { Camera2D } from "../components/camera-2d";
import { middleOf } from "../drawable-of";

/** The world's layers a camera moved, to put them back once no camera is left. */
const moved = new WeakSet<object>();

/**
 * Where the world's layer goes on one axis to show `target` in the middle of the view (`start`
 * and `size`, in game coordinates), kept inside the world from `edge`, `length` long, if any.
 */
const place = (
  target: number,
  start: number,
  size: number,
  zoom: number,
  edge: number,
  length: number,
): number => {
  const middle = start + size / 2;
  if (length <= 0) return middle - target * zoom;
  // A world smaller than the view stays in its middle.
  if (length * zoom <= size) return middle - (edge + length / 2) * zoom;
  const most = start - edge * zoom;
  const least = start + size - (edge + length) * zoom;
  return Math.min(most, Math.max(least, middle - target * zoom));
};

/**
 * Moves the view so the entity the first `Camera2D` follows stays in its middle, gliding by its
 * `lag`: the camera's own entity, when its `target` is empty or its own `Tag` has it, or else the
 * first entity tagged with its `target` that has a `Position2D`. Add it after the systems that
 * move entities, before `draw2D`.
 *
 * @remarks
 * It moves and zooms the world's layer (`ctx.graphics.baseLayer`). While it follows nothing, the
 * view stays where it is; the layer goes back in place once no entity has a `Camera2D`.
 *
 * @system
 * @side client
 */
export const followCamera2D = (registry: Registry, ctx: Context) => {
  const { stage, baseLayer } = ctx.graphics;
  const camera = registry.getIndexedZipper([Camera2D])[0];
  if (!camera) {
    if (moved.delete(baseLayer)) {
      baseLayer.position({ x: 0, y: 0 });
      baseLayer.scale({ x: 1, y: 1 });
    }
    return;
  }

  const settings = camera.Camera2D as Camera2D;
  const positionOf = (id: number): Position2D | undefined =>
    registry.getEntityComponent(registry.entityFromIndex(id), Position2D);
  const ids = settings.target ? taggedIds(registry, settings.target) : [camera.id];
  // Its own entity first, when it has the tag: other players can share it.
  const followed = ids.includes(camera.id)
    ? camera.id
    : ids.find((id) => positionOf(id) !== undefined);
  // With nothing to follow, the view stays where it is.
  const position = followed === undefined ? undefined : positionOf(followed);
  if (followed === undefined || position === undefined) return;
  const target = middleOf(registry, registry.entityFromIndex(followed), position);
  const zoom = settings.zoom > 0 ? settings.zoom : 1;
  // The part of the game the screen shows, in game coordinates: the stage holds the viewport.
  const scaleX = stage.scaleX();
  const scaleY = stage.scaleY();
  const x = place(
    target.x,
    -stage.x() / scaleX,
    stage.width() / scaleX,
    zoom,
    settings.left,
    settings.worldWidth,
  );
  const y = place(
    target.y,
    -stage.y() / scaleY,
    stage.height() / scaleY,
    zoom,
    settings.top,
    settings.worldHeight,
  );
  // A zero-size viewport (hidden tab, collapsed panel) gives a scale of 0: keep the view as it is.
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;

  const share =
    settings.placed && settings.lag > 0 ? 1 - Math.exp(-ctx.app.delta / 1000 / settings.lag) : 1;
  settings.viewX += (x - settings.viewX) * share;
  settings.viewY += (y - settings.viewY) * share;
  settings.placed = true;
  baseLayer.position({ x: settings.viewX, y: settings.viewY });
  baseLayer.scale({ x: zoom, y: zoom });
  moved.add(baseLayer);
};
