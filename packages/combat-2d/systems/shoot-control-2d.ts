import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import "@nanoforge-dev/input";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { Velocity2D } from "@nanoforge/basics-2d/components/velocity-2d";
import { DrawableCircle2D } from "@nanoforge/graphics-2d/components/drawable-circle-2d";
import { HitboxCircle2D } from "@nanoforge/physics-2d/components/hitbox-circle-2d";
import { HitboxRect2D } from "@nanoforge/physics-2d/components/hitbox-rect-2d";

import { DamageDealer } from "../components/damage-dealer";
import { DestroyOnHit2D } from "../components/destroy-on-hit-2d";
import { Owner } from "../components/owner";
import { ShootController2D } from "../components/shoot-controller-2d";

/**
 * Makes `ShootController2D` entities fire a bullet toward the mouse while their key is held,
 * once every `reloadTime`.
 *
 * @system
 * @side client
 */
export function shootControl2D(registry: Registry, ctx: Context) {
  const seconds = ctx.app.delta / 1000;
  const mouse = ctx.input.getMousePosition();

  registry
    .getIndexedZipper([ShootController2D, Position2D])
    .forEach(({ id, ShootController2D: shooter, Position2D: position }) => {
      const controller = shooter as ShootController2D;
      controller.reloadTimer -= seconds;
      if (controller.reloadTimer > 0 || ctx.input.isKeyPressed(controller.key) !== true) return;

      const entity = registry.entityFromIndex(id);
      const box: HitboxRect2D | undefined = registry.getEntityComponent(entity, HitboxRect2D);
      const x = position.x + (box?.width ?? 0) / 2;
      const y = position.y + (box?.height ?? 0) / 2;
      const distance = Math.hypot(mouse.x - x, mouse.y - y);
      if (distance === 0) return;

      const bullet = registry.spawnEntity();
      const speed = controller.speed / distance;
      registry.addComponent(bullet, new Position2D(x, y));
      registry.addComponent(bullet, new Velocity2D((mouse.x - x) * speed, (mouse.y - y) * speed));
      registry.addComponent(bullet, new HitboxCircle2D(controller.size));
      registry.addComponent(bullet, new DrawableCircle2D(controller.size, controller.color));
      registry.addComponent(bullet, new DamageDealer(controller.damage));
      registry.addComponent(bullet, new DestroyOnHit2D());
      registry.addComponent(bullet, new Owner(id));
      controller.reloadTimer = controller.reloadTime;
    });
}
