import { type EditorSystemManifest, type Entity, type Registry } from "@nanoforge-dev/ecs-lib";

import { DamageDealer } from "../components/nf-damage-dealer.component";
import { DrawableCircle2D } from "../components/nf-drawable-circle-2d.component";
import { DrawableRect2D } from "../components/nf-drawable-rect-2d.component";
import { DrawableText2D } from "../components/nf-drawable-text-2d.component";
import { Health } from "../components/nf-health.component";
import { HitboxCircle2D } from "../components/nf-hitbox-circle-2d.component";
import { HitboxRectangle2D } from "../components/nf-hitbox-rectangle-2d.component";
import { Owner } from "../components/nf-owner.component";

export function applyDamge2D(registry: Registry) {
  const entities = [
    ...registry.getIndexedZipper([DamageDealer, HitboxCircle2D]),
    ...registry.getIndexedZipper([DamageDealer, HitboxRectangle2D]),
  ];

  const entityToKill: Entity[] = [];
  entities.forEach(({ id, DamageDealer, HitboxCircle2D, HitboxRectangle2D }) => {
    (HitboxCircle2D ?? HitboxRectangle2D).entitiesColliding.forEach((e: number) => {
      const owner = registry.getEntityComponent(registry.entityFromIndex(id), Owner);
      if (owner && owner.owner.getId() === e) return;
      const health = registry.getEntityComponent(registry.entityFromIndex(e), Health);
      if (health) {
        health.currentHealth -= DamageDealer.damage;
        if (health.currentHealth <= 0) entityToKill.push(registry.entityFromIndex(e));
      }
    });
  });
  entityToKill.forEach((e) => {
    registry.getEntityComponent(e, DrawableCircle2D)?.shape.destroy();
    registry.getEntityComponent(e, DrawableRect2D)?.shape.destroy();
    registry.getEntityComponent(e, DrawableText2D)?.shape.destroy();
    registry.killEntity(e);
  });
}
// * Required to generate code
export default applyDamge2D.name;

// * Required for the editor to display the system and generate code
export const EDITOR_SYSTEM_MANIFEST: EditorSystemManifest = {
  name: "applyDamge2D",
  description: "Apply damage to entity that have health and delete dead entities",
  dependencies: [
    "DamageDealer",
    "HitboxCircle2D",
    "HitboxRectangle2D",
    "Health",
    "Owner",
    "DrawableCircle2D",
    "DrawableRect2D",
    "DrawableText2D",
  ],
};
