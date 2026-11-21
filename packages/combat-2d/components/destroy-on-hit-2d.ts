/**
 * Removes the entity as soon as it touches another one: a bullet, a falling rock, a health pack
 * (`by` set to `player`). Needs a hitbox (`HitboxRect2D` or `HitboxCircle2D`) and the
 * `destroyOnHit2D` system.
 *
 * @remarks
 * A wall or a floor (`StaticBody2D`) counts while `onStaticBodies` is on, whatever `by` is. Another
 * entity counts while `by` is empty or one of its `Tag` words. Its `Owner`, the entities it owns
 * (its bullets), and the entities with the same owner never count.
 *
 * @component
 * @side shared
 * @group Hits color=#e5484d - What destroys it.
 */
export class DestroyOnHit2D {
  name = "DestroyOnHit2D";

  constructor(
    /** Whether walls and floors (`StaticBody2D`) destroy it too. @group Hits */
    public onStaticBodies = true,
    /** The `Tag` of what destroys it; empty: any entity. @group Hits */
    public by = "",
  ) {}
}
