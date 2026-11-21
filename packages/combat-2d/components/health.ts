/**
 * Hit points of an entity: it is removed when they reach 0. A `DamageOnHit2D` that touches it
 * hurts it, or heals it up to `max` with a negative damage, with the `applyDamage2D` system.
 *
 * @component
 * @side shared
 * @group Health color=#e5484d - How much damage the entity takes before it dies.
 * @group Advanced hidden - Less common settings.
 */
export class Health {
  name = "Health";

  /** Hit points left, from `max` down to 0. */
  current: number;

  constructor(
    /** Hit points at the start, and the most it can have. @group Health */
    public max = 100,
    /** Whether the entity is removed at 0; off, it stays at 0 for your system (a respawn, a game over). @group Advanced */
    public removeAtZero = true,
  ) {
    this.current = max;
  }
}
