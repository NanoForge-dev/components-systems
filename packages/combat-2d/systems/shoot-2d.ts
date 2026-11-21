import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import { Lifetime } from "@nanoforge/basics-2d/components/lifetime";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { Tag } from "@nanoforge/basics-2d/components/tag";
import { Velocity2D } from "@nanoforge/basics-2d/components/velocity-2d";
import { FromModel, copyOf, modelOf } from "@nanoforge/basics-2d/models";
import { centerOf } from "@nanoforge/physics-2d/collisions";
import { Bounds2D } from "@nanoforge/physics-2d/components/bounds-2d";
import { HitboxCircle2D } from "@nanoforge/physics-2d/components/hitbox-circle-2d";
import { HitboxRect2D } from "@nanoforge/physics-2d/components/hitbox-rect-2d";

import { DamageOnHit2D } from "../components/damage-on-hit-2d";
import { DestroyOnHit2D } from "../components/destroy-on-hit-2d";
import { Owner } from "../components/owner";
import { Shoot2D } from "../components/shoot-2d";

/**
 * Fires the bullets of each `Shoot2D` that has a `Position2D`: while `fire` is on, or once for
 * `fireRequested`, `fireRate` times a second along its aim. Add it after the systems that set
 * `fire` and the aim (`readKeyboard2D`, `shootAtNearest2D`), with `showBullets2D` right after it
 * on the client. Not on a network client: there, the server shoots.
 *
 * @remarks
 * A bullet starts at the middle of the shooter's hitbox, with a copy of the model's hitbox
 * (`HitboxCircle2D(5)` without a model) and of its `Bounds2D`, a `Velocity2D`, a `DamageOnHit2D`
 * and a `DestroyOnHit2D` for `target`, an `Owner`, the model's `Tag` word, a `FromModel`, and a
 * `Lifetime` of `range` / `bulletSpeed`: add `move2D`, `detectCollisions2D`, `applyDamage2D`,
 * `destroyOnHit2D` and `expireLifetimes` (`keepInBounds2D` with a range of 0 and a `Bounds2D`). A
 * zero or invalid aim, or a `fireRate` of 0, holds fire.
 *
 * @system
 * @side shared
 */
export const shoot2D = (registry: Registry, ctx: Context) => {
  const seconds = ctx.app.delta / 1000;

  // Renamed: `new Position2D` below needs the class.
  registry
    .getIndexedZipper([Shoot2D, Position2D])
    .forEach(({ id, Shoot2D: shooter, Position2D: position }) => {
      const shoot = shooter as Shoot2D;
      shoot.cooldown -= seconds;
      const wants = shoot.fire || shoot.fireRequested;
      shoot.fireRequested = false;
      const length = Math.hypot(shoot.aimX, shoot.aimY);
      const ready = shoot.cooldown <= 0 && shoot.fireRate > 0;
      if (!wants || !ready || !(length > 0) || !Number.isFinite(length)) {
        shoot.cooldown = Math.max(0, shoot.cooldown);
        return;
      }

      const center = centerOf(registry, registry.entityFromIndex(id), position as Position2D);
      const model = modelOf(registry, shoot.bulletModel);
      const from = model === undefined ? undefined : registry.entityFromIndex(model);
      const hitbox: HitboxRect2D | HitboxCircle2D =
        (from &&
          (registry.getEntityComponent(from, HitboxRect2D) ??
            registry.getEntityComponent(from, HitboxCircle2D))) ??
        new HitboxCircle2D(5);
      // A range of 0 never expires: a Bounds2D on the model removes the bullets off the area.
      const bounds: Bounds2D | undefined = from && registry.getEntityComponent(from, Bounds2D);
      // The position that puts the middle of the bullet's hitbox on the shooter's.
      const rect = hitbox instanceof HitboxRect2D;
      const x = center.x - hitbox.offsetX - (rect ? hitbox.width / 2 : 0);
      const y = center.y - hitbox.offsetY - (rect ? hitbox.height / 2 : 0);
      const aimX = shoot.aimX / length;
      const aimY = shoot.aimY / length;
      const count = Math.max(1, Math.floor(shoot.bulletsPerShot));

      for (let i = 0; i < count; i++) {
        // Fanned evenly over spreadAngle degrees, around the aim.
        const turn =
          (count === 1 ? 0 : (i / (count - 1) - 0.5) * shoot.spreadAngle) * (Math.PI / 180);
        const cos = Math.cos(turn);
        const sin = Math.sin(turn);
        const bullet = registry.spawnEntity();
        registry.addComponent(bullet, new Position2D(x, y));
        registry.addComponent(
          bullet,
          new Velocity2D(
            (aimX * cos - aimY * sin) * shoot.bulletSpeed,
            (aimX * sin + aimY * cos) * shoot.bulletSpeed,
          ),
        );
        registry.addComponent(bullet, copyOf(hitbox));
        if (bounds) registry.addComponent(bullet, copyOf(bounds));
        if (shoot.bulletModel !== "") registry.addComponent(bullet, new Tag(shoot.bulletModel));
        registry.addComponent(bullet, new FromModel(shoot.bulletModel));
        registry.addComponent(bullet, new DamageOnHit2D(shoot.damage, shoot.target));
        registry.addComponent(bullet, new DestroyOnHit2D(true, shoot.target));
        registry.addComponent(bullet, Object.assign(new Owner(), { entity: id as number }));
        if (shoot.range > 0 && shoot.bulletSpeed > 0)
          registry.addComponent(bullet, new Lifetime(shoot.range / shoot.bulletSpeed));
      }
      // The time it fired late counts toward the next shot, so the rate doesn't depend on the frames.
      shoot.cooldown = Math.max(0, shoot.cooldown + 1 / shoot.fireRate);
    });
};
