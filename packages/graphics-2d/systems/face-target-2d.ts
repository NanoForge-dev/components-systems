import type { Registry } from "@nanoforge-dev/ecs";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { taggedIds } from "@nanoforge/basics-2d/tags";

import { FaceTarget2D } from "../components/face-target-2d";
import { drawableOf, middleOf } from "../drawable-of";
import { faceToward } from "../face-toward";

/**
 * Turns the drawable of each `FaceTarget2D` entity toward the first other entity tagged with its
 * `target` that has a `Position2D`, middle to middle. Add it after the systems that move entities,
 * after `animateMoves2D` and `faceVelocity2D`, before `draw2D`.
 *
 * @remarks
 * While no entity has the tag, the drawable keeps its look.
 *
 * @system
 * @side client
 */
export const faceTarget2D = (registry: Registry) => {
  const positionOf = (id: number): Position2D | undefined =>
    registry.getEntityComponent(registry.entityFromIndex(id), Position2D);

  registry
    .getIndexedZipper([FaceTarget2D, Position2D])
    .forEach(({ id, FaceTarget2D, Position2D }) => {
      const face = FaceTarget2D as FaceTarget2D;
      const entity = registry.entityFromIndex(id);
      const drawable = drawableOf(registry, entity);
      const target = taggedIds(registry, face.target).find(
        (other) => other !== id && positionOf(other) !== undefined,
      );
      const position = target === undefined ? undefined : positionOf(target);
      if (!drawable || target === undefined || position === undefined) return;

      const from = middleOf(registry, entity, Position2D as Position2D);
      const to = middleOf(registry, registry.entityFromIndex(target), position);
      faceToward(drawable, to.x - from.x, to.y - from.y, face.imageFacing, face.keepUpright);
    });
};
