import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import { Model } from "@nanoforge/basics-2d/components/model";

import { DrawableRect2D } from "../components/drawable-rect-2d";
import { SpriteAnimation2D } from "../components/sprite-animation-2d";

/**
 * Plays each `SpriteAnimation2D`: crops its `DrawableRect2D` image to the frame of the time.
 * Add it before `draw2D`, after `animateMoves2D`.
 *
 * @remarks
 * A `Model`'s animation doesn't play, so its copies start on their first frame. A row has the
 * frames `rowFrames` gives it, else `frames`.
 *
 * @system
 * @side client
 */
export const animateSprites2D = (registry: Registry, ctx: Context) => {
  const seconds = ctx.app.delta / 1000;

  registry
    .getIndexedZipper([SpriteAnimation2D, DrawableRect2D])
    .forEach(({ id, SpriteAnimation2D, DrawableRect2D }) => {
      if (registry.getEntityComponent(registry.entityFromIndex(id), Model)) return;
      const animation = SpriteAnimation2D as SpriteAnimation2D;
      const rect = DrawableRect2D as DrawableRect2D;
      if (animation.playedRow === animation.row) animation.elapsed += seconds;
      else {
        animation.playedRow = animation.row;
        animation.elapsed = 0;
      }

      // `Number` reads " 8" as 8, and a missing or empty entry as NaN or 0: then `frames`.
      const rowFrames = Number(animation.rowFrames.split(",")[animation.row]);
      const frames = Math.max(1, Math.floor(rowFrames > 0 ? rowFrames : animation.frames));
      const played = Math.floor(animation.elapsed * animation.fps);
      animation.frame = animation.loop ? played % frames : Math.min(played, frames - 1);
      rect.cropX = animation.frame * animation.frameWidth;
      rect.cropY = animation.row * animation.frameHeight;
      rect.cropWidth = animation.frameWidth;
      rect.cropHeight = animation.frameHeight;
    });
};
