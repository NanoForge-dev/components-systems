/**
 * The entity this one belongs to, such as the player who fired a bullet: the bullet never hurts
 * it, nor is destroyed by it. Set from code, with the owner's id (`entity.getId()`).
 *
 * @component
 * @side shared
 */
export class Owner {
  name = "Owner";

  constructor(
    /** Id of the owner entity. */
    public entity = -1,
  ) {}
}
