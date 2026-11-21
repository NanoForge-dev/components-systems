# @nanoforge/physics-2d

Collisions, gravity, solid ground, bounces, walking, jumping and chasing in 2D.

- `HitboxRect2D`, `HitboxCircle2D` with `detectCollisions2D`: each hitbox's `collisions` lists the
  ids of the entities it touches. An offset (Advanced) moves the hitbox off the `Position2D`, for a
  hitbox smaller than its sprite and centered on it. `collisions.ts` reads them (`boxOf`,
  `centerOf`, `nearest`).
- `RigidBody2D` with `applyGravity2D`: falls. Add `blockOnStaticBodies2D` so it stands on
  `StaticBody2D` entities (walls, floors, one-way platforms) and knows when it is `grounded`. With a
  `bounce`, it bounces off them instead: `RigidBody2D(0, 1)` is a ball.
- `StaticBody2D` with `blockOnStaticBodies2D`: a wall that stops `RigidBody2D` and `WalkAndJump2D`
  entities. Both hitboxes block; a circle blocks as its bounding square.
- `DeflectOnHit2D` with `deflectOnHit2D`: sends what bounces off it (a `RigidBody2D` with a
  `bounce`) toward its `direction`, at a wider angle the further from its middle it is hit: a pong
  or breakout paddle, a bumper. Any hitbox works, offsets included.
- `WalkAndJump2D` with `walkAndJump2D`: walks at its `speed` where its `moveX`/`moveY` say, and with
  a `RigidBody2D` jumps `jumpHeight` pixels on `jumpRequested`. A `KeyboardControls2D` or
  `GamepadControls2D` (`@nanoforge/controls-2d`), a `ChaseNearest2D`, your system or the server
  fills them. Walls stop it, even without a `RigidBody2D`. Not on a network client.
- `ChaseNearest2D` with `chaseNearest2D`: walks its `WalkAndJump2D` toward the nearest entity
  tagged `target`, within its `range`, at full speed on the axes it walks: under gravity, it heads
  left or right for the target's side, even while the target jumps.
- `Bounds2D` with `keepInBounds2D`: keeps an entity inside an area, brings it back on the other
  side, or removes it once out (not on a network client), by its hitbox.

Order: `chaseNearest2D`, `walkAndJump2D`, `applyGravity2D`, `move2D`, `keepInBounds2D`,
`detectCollisions2D`, `blockOnStaticBodies2D`, `deflectOnHit2D`.

## Recipes

- Platformer hero: `Position2D`, `Velocity2D`, a drawable, `HitboxRect2D`, `RigidBody2D()`,
  `WalkAndJump2D()` and `KeyboardControls2D()`; floors are `HitboxRect2D` + `StaticBody2D`. The
  arrows walk and Space jumps 128 pixels. Systems: `readKeyboard2D`, `walkAndJump2D`,
  `applyGravity2D`, `move2D`, `detectCollisions2D`, `blockOnStaticBodies2D`, `draw2D`.
- Top-down hero: `Position2D`, `Velocity2D`, a drawable, `HitboxRect2D`, `WalkAndJump2D()` and
  `KeyboardControls2D()`; walls are `HitboxRect2D` + `StaticBody2D`. Systems: `readKeyboard2D`,
  `walkAndJump2D`, `move2D`, `detectCollisions2D`, `blockOnStaticBodies2D`, `draw2D`.
- Chasing enemy: `Position2D`, `Velocity2D`, a drawable, `HitboxRect2D`, `Tag("enemy")`,
  `WalkAndJump2D(100)` and `ChaseNearest2D()`, after the player's `Tag("player")`. To hurt the
  player and be killed, add `DamageOnHit2D(10, "player")` and `Health(30)`
  (`@nanoforge/combat-2d`). Systems: `chaseNearest2D`, `walkAndJump2D`, `move2D`,
  `detectCollisions2D`, `blockOnStaticBodies2D`, then `applyDamage2D`.
- Pong: each paddle is a `HitboxRect2D(20, 100)`, a `DeflectOnHit2D("right")` on the left one or
  `DeflectOnHit2D("left")` on the right one, a `WalkAndJump2D(1000, "vertical")` and a
  `KeyboardControls2D` with its own keys (`@nanoforge/controls-2d`). The ball is a
  `HitboxCircle2D(15)`, a `RigidBody2D(0, 1)` (no gravity, full bounce), a `Velocity2D` that starts
  it and a `Tag("ball")`. Walls are `HitboxRect2D` + `StaticBody2D`. A goal is a `HitboxRect2D` +
  `AddToVarOnEnter2D("rightScore", 1, "ball")` (`@nanoforge/scenes-2d`); putting the ball back
  after a goal is game code. Systems: `readKeyboard2D`, `walkAndJump2D`, `move2D`,
  `detectCollisions2D`, `blockOnStaticBodies2D`, `deflectOnHit2D`, `addToVarOnEnter2D`,
  `showSceneVars2D`, `draw2D`.
- Breakout: the paddle is a `HitboxRect2D`, a `DeflectOnHit2D()`, a
  `WalkAndJump2D(600, "horizontal")` and a `KeyboardControls2D()`; the ball is the pong ball. A
  brick is a `HitboxRect2D`, a drawable, a `StaticBody2D` and a `Collectible2D("score", 10, "ball")`:
  the ball bounces off it, then it gives 10 points and goes. The floor is a `HitboxRect2D` +
  `AddToVarOnEnter2D("lives", -1, "ball")`. Systems: the pong ones, with `collect2D` after
  `addToVarOnEnter2D`.
