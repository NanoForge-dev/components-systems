import { type EditorSystemManifest, type Registry, Entity } from "@nanoforge-dev/ecs-lib";

import { DestroyOnHit2D } from "../components/nf-destroy-on-hit-2d.component";
import { HitboxCircle2D } from "../components/nf-hitbox-circle-2d.component";
import { HitboxRectangle2D } from "../components/nf-hitbox-rectangle-2d.component";
import { Owner } from "../components/nf-owner.component";
import { StaticBody2D } from "../components/nf-static-body-2d.component";
import { DrawableCircle2D } from "../components/nf-drawable-circle-2d.component";
import { DrawableRect2D } from "../components/nf-drawable-rect-2d.component";
import { DrawableText2D } from "../components/nf-drawable-text-2d.component";

export function destroyOnHit2D(registry: Registry) {
  const entities = [
    ...registry.getIndexedZipper([DestroyOnHit2D, HitboxCircle2D]),
    ...registry.getIndexedZipper([DestroyOnHit2D, HitboxRectangle2D])
  ];

  const entityToKill: Entity[] = [];
  entities.forEach(({ id, DestroyOnHit2D, HitboxCircle2D, HitboxRectangle2D }) => {
    (HitboxCircle2D ?? HitboxRectangle2D).entitiesColliding.forEach(e => {
      const owner = registry.getEntityComponent(registry.entityFromIndex(id), Owner);
      if (owner && !DestroyOnHit2D.destroyOnOwner && owner.owner.getId() === e) {
        return
      }
      if (!DestroyOnHit2D.destroyOnStaticBody && registry.getEntityComponent(registry.entityFromIndex(e), StaticBody2D))
        return;
      entityToKill.push(registry.entityFromIndex(id))
    })
  });
  entityToKill.forEach(e => {
    registry.getEntityComponent(e, DrawableCircle2D)?.shape.destroy()
    registry.getEntityComponent(e, DrawableRect2D)?.shape.destroy()
    registry.getEntityComponent(e, DrawableText2D)?.shape.destroy()
    registry.killEntity(e)
  })
}
// * Required to generate code
export default destroyOnHit2D.name;

// * Required for the editor to display the system and generate code
export const EDITOR_SYSTEM_MANIFEST: EditorSystemManifest = {
  name: "destroyOnHit2D",
  description: "Destroy entities with DestroyOnHit2D when they collide with other entities",
  dependencies: [
    "DestroyOnHit2D",
    "HitboxCircle2D",
    "HitboxRectangle2D",
    "Owner",
    "StaticBody2D",
    "DrawableCircle2D",
    "DrawableRect2D",
    "DrawableText2D",
  ],
};
