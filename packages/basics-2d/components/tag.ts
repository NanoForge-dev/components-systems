/**
 * Words that other items find the entity by, such as `player` or `enemy`. Items that act on it
 * name it in their `target`: `Follow2D`, `Camera2D`, `ChaseNearest2D` and `FaceTarget2D` go after
 * it or look at it; `Shoot2D`, `DamageOnHit2D` and `HealthBar2D` hurt it or show its health. Items
 * it acts on name it in their `by`: it picks up a `Collectible2D`, enters an `AddToVarOnEnter2D`
 * and destroys a `DestroyOnHit2D`. With a `Model`, it names a model (`Shoot2D.bulletModel`).
 *
 * @remarks
 * Several entities can share a word.
 *
 * @component
 * @side shared
 * @group Tag color=#4aa3ff - How other items find the entity.
 */
export class Tag {
  name = "Tag";

  constructor(
    /** One word such as `player`, `enemy` or `coin`, or several separated by spaces (`player p2`): items find the entity by any of them. @group Tag @label Tag */
    public value = "player",
  ) {}
}
