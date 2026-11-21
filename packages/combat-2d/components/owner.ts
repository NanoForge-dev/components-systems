/**
 * The entity this one belongs to, added by `shoot2D` to its bullets: an entity never hurts or
 * destroys what it belongs to, nor is hurt or destroyed by it, and entities with the same owner
 * don't hit each other.
 *
 * @remarks
 * From code: `Object.assign(new Owner(), { entity: shooter.getId() })`.
 *
 * @component
 * @side shared
 */
export class Owner {
  name = "Owner";

  /** Id of the entity it belongs to, set by `shoot2D`; -1 for none. */
  entity = -1;
}
