/**
 * Hurts the `Health` entities it touches, once each time it touches them. Needs a hitbox
 * (`HitboxRect2D` or `HitboxCircle2D`) and the `applyDamage2D` system.
 *
 * @component
 * @side shared
 * @group Damage color=#e5484d - How much it hurts.
 */
export class DamageDealer {
  name = "DamageDealer";

  /** Ids of the entities it touched last frame: they are not hurt again until they part. */
  touching = new Set<number>();

  constructor(
    /** Hit points removed from what it touches. @group Damage */
    public damage = 10,
  ) {}
}
