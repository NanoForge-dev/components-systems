/**
 * Makes the entity a model: a template that spawners copy, not part of the game. Give it a `Tag`
 * naming it, the components its copies get, and no `Position2D`. `Shoot2D` copies the model tagged
 * with its `bulletModel`.
 *
 * @remarks
 * Each spawner lists what it copies: `shoot2D` the hitbox and `Bounds2D`; `showBullets2D` the
 * drawable, `FaceVelocity2D` and `SpriteAnimation2D`. `expireLifetimes`, `fadeOut2D` and
 * `animateSprites2D` leave a model alone, so copies start fresh. A model with a `Position2D` is also
 * in the game. The Scene screen shows a model at the top-left corner.
 *
 * @example
 * A red bolt is `Tag("bullet")`, `Model`, `DrawableRect2D(20, 6, "#ff4040")`,
 * `HitboxCircle2D(3, 10, 3)` and `FaceVelocity2D()`.
 *
 * @component
 * @side shared
 */
export class Model {
  name = "Model";
}
