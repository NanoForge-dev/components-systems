/**
 * Kills the entity as soon as it touches another one: a bullet, a coin... Needs a hitbox
 * (`HitboxRect2D` or `HitboxCircle2D`) and the `destroyOnHit2D` system.
 *
 * @remarks
 * Its `Owner`, if it has one, never destroys it.
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
  ) {}
}
