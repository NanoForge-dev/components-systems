import { type EditorSystemManifest, type Registry } from "@nanoforge-dev/ecs-lib";

import { Grounded } from "../components/nf-grounded.component";
import { RigidBody2D } from "../components/nf-rigid-body-2d.component";
import { HitboxRectangle2D } from "../components/nf-hitbox-rectangle-2d.component";
import { HitboxCircle2D } from "../components/nf-hitbox-circle-2d.component";
import { StaticBody2D } from "../components/nf-static-body-2d.component";
import { Position2D } from "../components/nf-position-2d.component";
import { Velocity2D } from "../components/nf-velocity-2d.component";

export function grounded2D(registry: Registry) {
  const entities = [
    ...registry.getZipper([HitboxRectangle2D, Grounded, RigidBody2D, Position2D, Velocity2D]),
    ...registry.getZipper([HitboxCircle2D, Grounded, RigidBody2D, Position2D, Velocity2D]),
  ];
  entities.forEach(({ Grounded }) => Grounded.grounded = false)
  entities.forEach(({ HitboxRectangle2D, HitboxCircle2D, Grounded, Position2D, Velocity2D }) => {
    (HitboxCircle2D ?? HitboxRectangle2D).entitiesColliding.forEach(e => {
      const staticBody = registry.getEntityComponent(registry.entityFromIndex(e), StaticBody2D);
      if (staticBody) {
        const groundPos = registry.getEntityComponent(registry.entityFromIndex(e), Position2D)
        const groundXBox = registry.getEntityComponent(registry.entityFromIndex(e), HitboxRectangle2D)
        if (!groundPos || !groundXBox) return
        const groundTopPosY = groundPos.y
        const groundBotPosY = groundTopPosY + groundXBox.height;
        const groundLeftPos = groundPos.x
        const groundRightPos = groundLeftPos + groundXBox.width;
        const playerPos = Position2D.y + HitboxRectangle2D.height;
        if (staticBody.oneWay === undefined) {
          if (Velocity2D.y >= 0 && playerPos >= groundTopPosY && playerPos <= groundTopPosY + 0.3 * HitboxRectangle2D.height) {
            Grounded.grounded = true;
            Position2D.y = groundTopPosY - HitboxRectangle2D.height;
            Velocity2D.y = 0;

          } else if (Velocity2D.y < 0 && Position2D.y <= groundBotPosY && Position2D.y >= groundBotPosY - 0.3 * HitboxRectangle2D.height) {
            Grounded.grounded = false
            Position2D.y = groundBotPosY;
            Velocity2D.y = 0;
          } else {
            if (Velocity2D.x >= 0) {
              Position2D.x = groundLeftPos - HitboxRectangle2D.width;
            } else {
              Position2D.x = groundRightPos;
            }
            Velocity2D.x = 0;
          }
        } else if (staticBody.oneWay === "up") {
          if (Velocity2D.y > 0) {
            if (playerPos >= groundTopPosY && playerPos <= groundTopPosY + 0.3 * HitboxRectangle2D.height) {
              Grounded.grounded = true;
              Position2D.y = groundTopPosY - HitboxRectangle2D.height;
              Velocity2D.y = 0;
            }
          }
        }
      }
    })
  });
}
// * Required to generate code
export default grounded2D.name;

// * Required for the editor to display the system and generate code
export const EDITOR_SYSTEM_MANIFEST: EditorSystemManifest = {
  name: "grounded2D",
  description: "Ground entities that are on the ground",
  dependencies: [
    "HitboxRectangle2D",
    "HitboxCircle2D",
    "Grounded",
    "RigidBody2D",
    "StaticBody2D",
    "Position2D",
    "Velocity2D",
  ],
};
