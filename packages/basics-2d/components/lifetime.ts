/**
 * Removes the entity after some time: a bullet that hit nothing, an explosion, a "+10" that
 * floated up. Needs the `expireLifetimes` system.
 *
 * @component
 * @side shared
 * @group Lifetime color=#4aa3ff - How long the entity lasts.
 */
export class Lifetime {
  name = "Lifetime";

  /** Seconds left before the entity is removed, counted down by `expireLifetimes`. */
  left: number;

  constructor(
    /** Seconds the entity lasts. @group Lifetime */
    public seconds = 1,
  ) {
    this.left = seconds;
  }
}
