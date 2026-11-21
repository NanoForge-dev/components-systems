/**
 * Makes its `Shoot2D` fire at the nearest entity it can hurt within the `Shoot2D`'s `range`: tagged
 * with its `target`, or any `Health` when the target is empty. For turrets, towers, and enemies
 * that shoot back. Needs `Shoot2D`, `Position2D` and the `shootAtNearest2D` system.
 *
 * @remarks
 * Set the `Shoot2D`'s `target` (`player`). It writes `fire` and the aim every frame, overriding a
 * `fire` checked in the editor, and holds fire while nothing is in range. It aims from the middle
 * of its hitbox to the middle of the target's, and leaves out itself, its `Owner` and a `Health`
 * at 0.
 *
 * @component
 * @side shared
 */
export class ShootAtNearest2D {
  name = "ShootAtNearest2D";
}
