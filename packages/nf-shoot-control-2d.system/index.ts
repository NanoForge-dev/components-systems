import { type Context } from "@nanoforge-dev/common";
import { type EditorSystemManifest, type Registry } from "@nanoforge-dev/ecs-lib";
import { type InputLibrary } from "@nanoforge-dev/input";
import { Graphics2DLibrary, Vector2d } from "@nanoforge-dev/graphics-2d";

import { ShootController2D } from "../components/nf-shoot-controller-2d.component";
import { Position2D } from "../components/nf-position-2d.component";
import { Velocity2D } from "../components/nf-velocity-2d.component";
import { HitboxCircle2D } from "../components/nf-hitbox-circle-2d.component";
import { DrawableCircle2D } from "../components/nf-drawable-circle-2d.component";
import { DamageDealer } from "../components/nf-damage-dealer.component";
import { HitboxRectangle2D } from "../components/nf-hitbox-rectangle-2d.component";
import { DestroyOnHit2D } from "../components/nf-destroy-on-hit-2d.component";
import { Owner } from "../components/nf-owner.component";

function createBullet(registry: Registry, id: number, p: Vector2d, m: Vector2d, s: ShootController2D) {
  const b = registry.spawnEntity()

  if (!m?.x || !m?.y) return
  const dx = m.x - p.x;
  const dy = m.y - p.y;

  const length = Math.sqrt(dx * dx + dy * dy);

  const dirX = dx / length;
  const dirY = dy / length;

  registry.addComponent(b, new Position2D(p.x, p.y));
  registry.addComponent(b, new Velocity2D(dirX * s.bulletSpeed, dirY * s.bulletSpeed));
  registry.addComponent(b, new HitboxCircle2D(s.bulletSize))
  registry.addComponent(b, new DrawableCircle2D(s.bulletSize, true, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, "grey"))
  registry.addComponent(b, new DamageDealer(s.bulletDamage))
  registry.addComponent(b, new DestroyOnHit2D(false, true))
  const owner = new Owner();
  owner.owner = registry.entityFromIndex(id)
  registry.addComponent(b, owner)
}

export function shootControl2D(registry: Registry, ctx: Context) {
  const entities = registry.getIndexedZipper([ShootController2D, Position2D, HitboxRectangle2D]);
  const input = ctx.libs.getInput<InputLibrary>();
  const graphic2d = ctx.libs.getGraphics<Graphics2DLibrary>();

  entities.forEach(({ id, ShootController2D, Position2D, HitboxRectangle2D }) => {
    ShootController2D.reloadTimer -= ctx.app.delta / 1000;

    const keyPressed = input.isKeyPressed(ShootController2D.key);

    if (keyPressed && !ShootController2D.keyPressedLastFrame && ShootController2D.reloadTimer <= 0) {
      createBullet(registry, id, {
        x: Position2D.x + HitboxRectangle2D.width / 2,
        y: Position2D.y + HitboxRectangle2D.height / 2
      }, graphic2d.stage.getPointerPosition(), ShootController2D)
      ShootController2D.reloadTimer = ShootController2D.reloadTime;
    }
  });
}
// * Required to generate code
export default shootControl2D.name;

// * Required for the editor to display the system and generate code
export const EDITOR_SYSTEM_MANIFEST: EditorSystemManifest = {
  name: "shootControl2D",
  description: "Control entities that can shoot bullets at mouse position",
  dependencies: [
    "ShootController2D",
    "Position2D",
    "Velocity2D",
    "HitboxRectangle2D",
    "HitboxCircle2D",
    "DrawableCircle2D",
    "DamageDealer",
    "DestroyOnHit2D",
    "Owner",
  ],
};
