import type { Registry } from "@nanoforge-dev/ecs";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { FromModel, copyOf, modelOf } from "@nanoforge/basics-2d/models";
import { DrawableCircle2D } from "@nanoforge/graphics-2d/components/drawable-circle-2d";
import { DrawableRect2D } from "@nanoforge/graphics-2d/components/drawable-rect-2d";
import { FaceVelocity2D } from "@nanoforge/graphics-2d/components/face-velocity-2d";
import { SpriteAnimation2D } from "@nanoforge/graphics-2d/components/sprite-animation-2d";
import { drawableOf } from "@nanoforge/graphics-2d/drawable-of";
import { HitboxCircle2D } from "@nanoforge/physics-2d/components/hitbox-circle-2d";
import { HitboxRect2D } from "@nanoforge/physics-2d/components/hitbox-rect-2d";

/**
 * Gives each entity made from a model (`FromModel`, such as the bullets of `shoot2D`) that has no
 * drawable a copy of the model's `DrawableRect2D`, `DrawableCircle2D` or `DrawableText2D`, with
 * its `FaceVelocity2D` and `SpriteAnimation2D`. Add it right after `shoot2D`, on the client.
 *
 * @remarks
 * Without a model, or with a model that has no drawable, a bullet is a grey shape the size of its
 * hitbox: a dot of radius 5 for the default bullet. The grey shape sits at the bullet's
 * `Position2D` and ignores its hitbox's offset: give a model with an offset hitbox a drawable.
 *
 * @system
 * @side client
 */
export const showBullets2D = (registry: Registry) => {
  registry.getIndexedZipper([FromModel, Position2D]).forEach(({ id, FromModel }) => {
    const entity = registry.entityFromIndex(id);
    if (drawableOf(registry, entity)) return;

    const model = modelOf(registry, (FromModel as FromModel).model);
    const from = model === undefined ? undefined : registry.entityFromIndex(model);
    const look = from && drawableOf(registry, from);
    if (from && look) {
      registry.addComponent(entity, copyOf(look));
      for (const extra of [FaceVelocity2D, SpriteAnimation2D]) {
        const found: { name: string } | undefined = registry.getEntityComponent(from, extra);
        if (found) registry.addComponent(entity, copyOf(found));
      }
      return;
    }

    const rect: HitboxRect2D | undefined = registry.getEntityComponent(entity, HitboxRect2D);
    const circle: HitboxCircle2D | undefined = registry.getEntityComponent(entity, HitboxCircle2D);
    registry.addComponent(
      entity,
      rect
        ? new DrawableRect2D(rect.width, rect.height, "#cccccc")
        : new DrawableCircle2D(circle?.radius ?? 5, "#cccccc"),
    );
  });
};
