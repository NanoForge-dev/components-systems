/**
 * Hit points of an entity: it is killed when they reach 0. `DamageDealer` entities that touch it
 * remove some, with the `applyDamage2D` system.
 *
 * @component
 * @side shared
 * @group Health color=#e5484d - How much damage the entity takes before it dies.
 */
export class Health {
  name = "Health";

  /** Hit points left, from `max` down to 0. */
  current: number;

  constructor(
    /** Hit points at the start. @group Health */
    public max = 100,
  ) {
    this.current = max;
  }
}
