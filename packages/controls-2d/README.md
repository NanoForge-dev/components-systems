# @nanoforge/controls-2d

Control entities in 2D with the keyboard, the mouse or a gamepad. The device components fill what
the logic of other packages reads: where a `WalkAndJump2D` (`@nanoforge/physics-2d`) walks and when
it jumps, when a `Shoot2D` (`@nanoforge/combat-2d`) fires and where it aims. Hence its
dependencies: installing it installs both.

- `KeyboardControls2D` with `readKeyboard2D`: the arrows walk, Space jumps, and the left mouse
  button fires toward the cursor; any key can be set. `aimWith` set to `moveKeys` aims where the
  keys point, for a keyboard-only player. Two paddles on one keyboard are two of them with different
  keys.
- `GamepadControls2D` with `readGamepad2D`: the left stick or the D-pad walks, A jumps, the right
  stick aims and the right trigger fires. Needs the game's `ControllerLibrary`; without it,
  `readGamepad2D` warns once and does nothing.
- `Clickable2D` with `click2D`: tells when the cursor is over its rectangle or circle (`hovered`)
  and when it is clicked (`clicked`), for buttons and board cells. Only the top one under the cursor
  counts, and only `Clickable2D` entities hide what is under them: give a popup's background one.
  A press that clicks one doesn't fire a `Shoot2D` until it is released, even once the button is
  gone (Play, Close).
- `ColorOnHover2D` with `colorOnHover2D`: colors a `Clickable2D` while the cursor is over it, and
  keeps a color your system sets meanwhile. It changes the color, so it shows on a drawable without
  an image.
- `Draggable2D` with `drag2D`: drag and drop a rectangle or a circle with the mouse; of overlapping
  ones, only the top one moves, and one drag carries one entity.
- `FollowMouse2D` with `followMouse2D`: keeps the entity on the cursor, centered or by its top-left
  corner. Give it `Tag("cursor")` for a `FaceTarget2D` (`@nanoforge/graphics-2d`) to look at it.

What a device read stays on its component (`moveX`, `moveY`, `jump`, `fire`, `aimX`, `aimY`), for a
network client to send. A device writes a move or a fire while its key, button or stick is active,
and once more when it stops, so both devices, an AI or your code can drive the same entity. With
both devices, a pushed stick wins, and the mouse aims again once it moves. A mouse button doesn't
fire while the cursor is over a `Clickable2D` or drags a `Draggable2D`.

The mouse items work under a `Camera2D` and on `Hud2D` entities. `Draggable2D` and `FollowMouse2D`
are client-only conveniences: a server never sees their moves.

## Order

First in the frame, in this order: `click2D`, `drag2D`, `readKeyboard2D`, `readGamepad2D`,
`followMouse2D`. Then `colorOnHover2D` once everything moved, before `draw2D`.

## Recipes

- Platformer player: `Position2D`, `Velocity2D`, a drawable, `HitboxRect2D`, `RigidBody2D()`,
  `WalkAndJump2D()` and `KeyboardControls2D()`. The arrows walk and Space jumps 128 pixels. Systems:
  `readKeyboard2D`, `walkAndJump2D`, `applyGravity2D`, `move2D`, `detectCollisions2D`,
  `blockOnStaticBodies2D`, `draw2D`.
- Top-down shooter player: `Position2D`, `Velocity2D`, a drawable, a `HitboxRect2D` the size of the
  sprite, `Tag("player")`, `WalkAndJump2D()`, `Shoot2D(false, 3, 1, 0, "enemy")` and
  `KeyboardControls2D(KeyA, KeyD, KeyW, KeyS)`; `FaceAim2D()` (`@nanoforge/combat-2d`) turns it.
  WASD walks, the mouse aims from the hitbox's middle and its left button fires; custom bullets come
  from a model (see `Shoot2D`). Systems: `click2D`, `readKeyboard2D`, `walkAndJump2D`, `shoot2D`,
  `showBullets2D`, `move2D`, `detectCollisions2D`, `blockOnStaticBodies2D`, `applyDamage2D`,
  `destroyOnHit2D`, `faceVelocity2D`, `faceAim2D`, `draw2D`, `expireLifetimes`.
- Gamepad player: `Position2D`, `Velocity2D`, a drawable, `HitboxRect2D`, `WalkAndJump2D()`,
  `Shoot2D()` and `GamepadControls2D()`. Systems: `readGamepad2D`, `walkAndJump2D`, `shoot2D`,
  `showBullets2D`, `move2D`, `detectCollisions2D`, `blockOnStaticBodies2D`, `applyDamage2D`,
  `destroyOnHit2D`, `draw2D`, `expireLifetimes`. For a platformer, add `RigidBody2D` (A jumps) and
  `applyGravity2D` after `walkAndJump2D`, and set `aimWith` to `leftStick`. For both devices, add
  `KeyboardControls2D` and `readKeyboard2D` before `readGamepad2D`.
- Menu button: `Position2D`, `DrawableRect2D(200, 60)`, `Clickable2D()` and `ColorOnHover2D()`,
  with a `DrawableText2D` label on an entity of its own. Your system, added after `click2D`, reads
  `clicked`. Systems: `click2D`, `colorOnHover2D`, `draw2D`.
