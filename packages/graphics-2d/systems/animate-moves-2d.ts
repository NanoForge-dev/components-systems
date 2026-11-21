import type { Registry } from "@nanoforge-dev/ecs";
import { Velocity2D } from "@nanoforge/basics-2d/components/velocity-2d";

import { DrawableRect2D } from "../components/drawable-rect-2d";
import { MoveAnimation2D } from "../components/move-animation-2d";
import { SpriteAnimation2D } from "../components/sprite-animation-2d";

/**
 * Sets the row of each `MoveAnimation2D` entity's `SpriteAnimation2D` from its `Velocity2D`, and
 * mirrors its `DrawableRect2D` while it moves left. Add it after the systems that move entities,
 * before `faceVelocity2D`, `faceTarget2D`, `faceAim2D` (their facing wins) and `animateSprites2D`.
 *
 * @system
 * @side client
 */
export const animateMoves2D = (registry: Registry) => {
  registry
    .getZipper([MoveAnimation2D, Velocity2D, SpriteAnimation2D, DrawableRect2D])
    .forEach(({ MoveAnimation2D, Velocity2D, SpriteAnimation2D, DrawableRect2D }) => {
      const moves = MoveAnimation2D as MoveAnimation2D;
      const velocity = Velocity2D as Velocity2D;
      const sideView = moves.jumpRow >= 0 || moves.fallRow >= 0;
      const fallRow = moves.fallRow >= 0 ? moves.fallRow : moves.jumpRow;
      const walking = velocity.x !== 0 || (!sideView && velocity.y !== 0);

      if (sideView && velocity.y < 0 && moves.jumpRow >= 0) SpriteAnimation2D.row = moves.jumpRow;
      else if (sideView && velocity.y > 0 && fallRow >= 0) SpriteAnimation2D.row = fallRow;
      else SpriteAnimation2D.row = walking ? moves.walkRow : moves.idleRow;
      // Standing still, it keeps looking the way it went.
      if (moves.flip && velocity.x !== 0) DrawableRect2D.flipX = velocity.x < 0;
    });
};
