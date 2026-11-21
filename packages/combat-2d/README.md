# @nanoforge/combat-2d

Health, damage and shooting in 2D. A `Shoot2D` is fired by a player (`KeyboardControls2D` or
`GamepadControls2D`, from `@nanoforge/controls-2d`), a turret (`ShootAtNearest2D`), the server or
your code, and its bullets look like a model.

- `Health`: hit points; the entity is removed at 0, unless `removeAtZero` (Advanced) is off.
- `DamageOnHit2D` with `applyDamage2D` (was `DamageDealer`): hurts the `Health` entities tagged
  `target` that it touches, and again every second while they keep touching (`hitRate`). A negative
  damage heals, up to `max`.
- `DestroyOnHit2D` with `destroyOnHit2D`: removed as soon as it touches a wall, or an entity tagged
  `by` (any entity when empty).
- `Owner`: what an entity belongs to, set by `shoot2D` on its bullets. A bullet never hurts or
  destroys its shooter, nor is destroyed by it, and bullets of the same shooter don't hit each other.
- `Shoot2D` with `shoot2D` (replaces `ShootController2D`, whose key is now `KeyboardControls2D`'s
  `fireKey`): fires `fireRate` times a second along its aim while `fire` is on, from the middle of
  its hitbox. A bullet hurts the `Health` tagged `target`, is destroyed on hit, and goes after
  `range` pixels with `expireLifetimes` (`@nanoforge/basics-2d`); with a `range` of 0, once out of
  the area of a `Bounds2D` in destroy mode on the model (`keepInBounds2D`).
- `showBullets2D`: gives the bullets the look of their model, or a grey dot without one (at the
  bullet's `Position2D`, whatever its hitbox's offset: give such a model a drawable).
- `ShootAtNearest2D` with `shootAtNearest2D`: aims its `Shoot2D` at the nearest entity tagged with
  its `target` within its `range`, and fires; it holds fire while nobody is in range.
- `FaceAim2D` with `faceAim2D`: turns the drawable toward where its `Shoot2D` aims.
- `HealthBar2D` with `drawHealthBars2D`: a bar with the health left, over the entity; or the health
  of the entity tagged `target`, at the bar's own position (on the screen with `Hud2D`).

## Bullets

A bullet's look and hitbox come from a model: an entity with a `Model` (`@nanoforge/basics-2d`),
the `Tag` word of the `Shoot2D`'s `bulletModel` (`bullet` by default), a hitbox and a drawable.
`shoot2D` copies its hitbox and its `Bounds2D`, and `showBullets2D` its drawable, `FaceVelocity2D`
and `SpriteAnimation2D`. A red bolt is `Tag("bullet")`, `Model`, `DrawableRect2D(20, 6, "#ff4040")`,
`HitboxCircle2D(3, 10, 3)` and `FaceVelocity2D()`: a bullet that turns needs a `HitboxCircle2D`.
Without a model, bullets are grey dots of 10 pixels.

Bullets aren't removed with their scene: remove them in its teardown.

## Which app runs what

- A single-player game runs `shoot2D` and `showBullets2D`.
- A server runs `shoot2D`, but its bullets don't reach the clients yet (`@nanoforge/network-2d`,
  later): networked shooting needs game code for now.
- A network client runs neither, nor `applyDamage2D` and `destroyOnHit2D`: the server owns the
  entities.

## Order

`shootAtNearest2D`, `shoot2D`, then `showBullets2D`, with the systems that act on the intents,
before `move2D`; `applyDamage2D` then `destroyOnHit2D` after `detectCollisions2D`; `faceAim2D` once
everything moved, after the other facing systems; `drawHealthBars2D` after `draw2D`.

## Recipes

- Top-down shooter player: `Position2D`, `Velocity2D`, a drawable, a `HitboxRect2D` the size of the
  sprite, `Tag("player")`, `WalkAndJump2D()` (`@nanoforge/physics-2d`),
  `Shoot2D(false, 3, 1, 0, "enemy")` and `KeyboardControls2D(KeyA, KeyD, KeyW, KeyS)`. `FaceAim2D()`
  turns it, and a `Health` makes it hurtable. Its bullets hurt only `Tag("enemy")`. Systems:
  `click2D`, `readKeyboard2D`, `walkAndJump2D`, `shoot2D`, `showBullets2D`, `move2D`,
  `detectCollisions2D`, `blockOnStaticBodies2D`, `applyDamage2D`, `destroyOnHit2D`,
  `faceVelocity2D`, `faceAim2D`, `draw2D`, `expireLifetimes`.
- Turret shooting at the player: `Position2D`, a drawable, a `HitboxRect2D` the size of the sprite,
  `Tag("enemy")`, `Shoot2D(false, 1, 1, 0, "player")`, `ShootAtNearest2D()` and `Health(50)`;
  `FaceAim2D()` turns it. The player has `Tag("player")` and a `Health`. It fires once a second
  within 1000 pixels, and runs on a server too. Systems: `shootAtNearest2D`, `shoot2D`,
  `showBullets2D`, `move2D`, `detectCollisions2D`, `applyDamage2D`, `destroyOnHit2D`, `faceAim2D`,
  `draw2D`, `expireLifetimes`.
- Enemy that chases the player: `Position2D`, `Velocity2D`, a drawable, `HitboxRect2D`,
  `Tag("enemy")`, `WalkAndJump2D(100)` and `ChaseNearest2D()` (`@nanoforge/physics-2d`),
  `DamageOnHit2D(10, "player")` and `Health(30)`. It hurts the player once a second while they
  touch. Systems: `chaseNearest2D`, `walkAndJump2D`, `move2D`, `detectCollisions2D`,
  `blockOnStaticBodies2D`, `applyDamage2D`.
- Health pack: `Position2D`, a drawable, `HitboxRect2D`, `DamageOnHit2D(-20, "player")` and
  `DestroyOnHit2D(false, "player")`: it heals the player by 20, up to its max, then goes. Systems:
  `detectCollisions2D`, `applyDamage2D`, `destroyOnHit2D`.
- Fixed cannon, no code: `Position2D`, a drawable, a `HitboxRect2D` the drawable's size and
  `Shoot2D(true, 1, 0, -1)`: it fires up from its middle once a second. Systems: `shoot2D`,
  `showBullets2D`, `move2D`, `detectCollisions2D`, `applyDamage2D`, `destroyOnHit2D`, `draw2D`,
  `expireLifetimes`.
- HUD health bar: `Position2D(20, 20)`, `Hud2D` and
  `HealthBar2D(200, 16, 0, "#5ec26a", "#3a3a3a", "player")`: the player's health in a corner.
  Systems: `draw2D`, then `drawHealthBars2D`.
