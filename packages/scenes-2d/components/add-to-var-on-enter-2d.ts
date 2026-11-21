/**
 * Adds `amount` to a scene var each time an entity tagged `by` enters it: a goal that scores, a
 * floor that takes a life, a finish line. With an empty `by`, anything but a `StaticBody2D`, a
 * `Collectible2D` or an `AddToVarOnEnter2D` counts.
 * Needs `Position2D`, a hitbox (`HitboxRect2D` or `HitboxCircle2D`) and the `addToVarOnEnter2D`
 * system.
 *
 * @remarks
 * An entity counts once per entry: it counts again only once it left. Unlike a `Collectible2D`, it
 * stays. Start the var in the setup of the scene that owns it, such as
 * `ctx.scenes.vars.init("lives", 3)`, and show it with a `SceneVarText2D`. A var that doesn't exist
 * yet counts as 0. The app needs a `SceneLibrary`.
 *
 * @example
 * The left goal of a pong scores for the right player:
 * `new AddToVarOnEnter2D("rightScore", 1, "ball")`. The floor of a breakout takes a life:
 * `new AddToVarOnEnter2D("lives", -1, "ball")`.
 *
 * @component
 * @side shared
 * @group Var color=#f9ca24 - The scene var it changes.
 * @group Entry color=#4aa3ff - What counts when it enters.
 */
export class AddToVarOnEnter2D {
  name = "AddToVarOnEnter2D";

  /** Ids of the entities that counted and still touched it at the last frame. */
  inside = new Set<number>();

  constructor(
    /** The scene var it adds to. @group Var */
    public variable = "score",
    /** Added to the var at each entry; -1 takes a life. @group Var */
    public amount = 1,
    /** A `Tag` word of what counts; empty: anything but a `StaticBody2D`, a `Collectible2D` or an `AddToVarOnEnter2D`. @group Entry */
    public by = "player",
  ) {}
}
