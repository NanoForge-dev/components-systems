# @nanoforge/scenes-2d

Scene vars in a 2D game (the engine's `scene` library): the editor lists, renames and shows them
live.

- `SceneVarText2D` with `showSceneVars2D`: shows a var in a `DrawableText2D`, through a template
  (`"Score {}"`), and `-` while the var doesn't exist.
- `Collectible2D` with `collect2D`: picked up by the entities with the right `Tag` word, or by
  anything but a `StaticBody2D`, a `Collectible2D` or an `AddToVarOnEnter2D` when its `by` is empty,
  it adds to a var and disappears. Needs a hitbox and `detectCollisions2D` from
  `@nanoforge/physics-2d`. Not on a network client: there, the server picks things up.
- `AddToVarOnEnter2D` with `addToVarOnEnter2D`: adds to a var each time an entity with the right
  `Tag` word enters it (anything but a `StaticBody2D`, a `Collectible2D` or an `AddToVarOnEnter2D`
  when its `by` is empty), once per entry, and stays: a goal that scores, a floor that takes a life,
  a finish line. Needs a hitbox and `detectCollisions2D`.

An empty `by` still counts any other hitbox, such as a spike with a `DamageOnHit2D`: a coin placed
on one is picked up at once. Give it a `by` there.

## Starting the vars

The app needs a `SceneLibrary`. Start each var in the setup of the scene that owns it, such as
`ctx.scenes.vars.init("score", 0)`. Otherwise a text shows `-` until the var exists, and the first
pickup makes the var in the scene loaded deepest, so it goes when that scene unloads.

## Order

`addToVarOnEnter2D`, then `collect2D`, with the contact systems, after `detectCollisions2D` and
`blockOnStaticBodies2D`, so a brick that is collected still bounces the ball. `showSceneVars2D`
once everything moved, before `draw2D`.

## Recipes

- A coin and a score text: the coin is a `DrawableCircle2D`, a `HitboxCircle2D` and a
  `Collectible2D()`; the player has a `Tag("player")` and a hitbox; the text is a `Hud2D`, a
  `DrawableText2D` and a `SceneVarText2D("score", "Score {}")`. The scene's setup starts `score`
  with `ctx.scenes.vars.init("score", 0)`. Systems: `detectCollisions2D`, `collect2D`,
  `showSceneVars2D`, `draw2D`.
- Goals and lives: a pong goal is a `HitboxRect2D` + `AddToVarOnEnter2D("rightScore", 1, "ball")`,
  and a breakout floor a `HitboxRect2D` + `AddToVarOnEnter2D("lives", -1, "ball")`; the ball has a
  `Tag("ball")`. The scene's setup starts the vars. Systems: `detectCollisions2D`,
  `addToVarOnEnter2D`, `showSceneVars2D`, `draw2D`.
