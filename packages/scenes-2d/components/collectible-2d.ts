/**
 * Something to pick up: a coin, a gem, ammo. When an entity tagged `by` touches it, it adds
 * `amount` to a scene var and disappears; with an empty `by`, anything but a `StaticBody2D`, a
 * `Collectible2D` or an `AddToVarOnEnter2D` picks it up. Needs a hitbox (`HitboxRect2D` or `HitboxCircle2D`) and the `collect2D` system.
 *
 * @remarks
 * Start the var with `ctx.scenes.vars.init` in the setup of the scene that owns it, such as
 * `ctx.scenes.vars.init("score", 0)`, and show it with a `SceneVarText2D`. A var that doesn't
 * exist yet starts at 0, but the first pickup makes it in the scene loaded deepest, and it goes
 * when that scene unloads. The app needs a `SceneLibrary`.
 *
 * @example
 * A coin worth 10 points for the entity whose `Tag` is `player`: `new Collectible2D("score", 10)`.
 *
 * @component
 * @side shared
 * @group Reward color=#f9ca24 - What picking it up gives.
 * @group Pickup color=#4aa3ff - Who picks it up.
 */
export class Collectible2D {
  name = "Collectible2D";

  constructor(
    /** The scene var it adds to. @group Reward */
    public variable = "score",
    /** What it adds to the var. @group Reward */
    public amount = 1,
    /** A `Tag` word of what picks it up; empty: anything but a `StaticBody2D`, a `Collectible2D` or an `AddToVarOnEnter2D`. @group Pickup */
    public by = "player",
  ) {}
}
