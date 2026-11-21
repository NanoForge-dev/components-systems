/**
 * Hurts the `Health` entities it touches: an enemy, spikes, lava, a bullet. Needs a hitbox
 * (`HitboxRect2D` or `HitboxCircle2D`) and the `applyDamage2D` system.
 *
 * @remarks
 * While they keep touching, it hurts them again `hitRate` times a second. A negative damage heals,
 * up to the `Health`'s `max`.
 *
 * @example
 * A health pack: `new DamageOnHit2D(-20, "player")` and `new DestroyOnHit2D(false, "player")`.
 *
 * @component
 * @side shared
 * @group Damage color=#e5484d - How much it hurts, and whom.
 * @group Advanced hidden - Less common settings.
 */
export class DamageOnHit2D {
  name = "DamageOnHit2D";

  /** Seconds before it hurts each entity it touches again, by id (`Infinity`: not until they part). */
  touching = new Map<number, number>();

  constructor(
    /** Hit points removed from what it touches. @group Damage */
    public damage = 10,
    /** The `Tag` of what it hurts; empty: every `Health`. @group Damage */
    public target = "",
    /** Hits per second on an entity it keeps touching; 0: once per contact. @group Advanced */
    public hitRate = 1,
  ) {}
}
