# Default packages

The packages the editor should install when it creates a new project. The editor doesn't install
any yet (project creation runs `nf new` only): this is the list to use once it does, and the one to
install by hand meanwhile.

## Installed by default

| Package                  | Why                                                                                                                              |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `@nanoforge/basics-2d`   | Every game has entities that are somewhere and move. `Position2D` is also what the Scene screen uses to place entities.          |
| `@nanoforge/graphics-2d` | Without it nothing is on screen. With `basics-2d`, a beginner places a colored rectangle, gives it a velocity, and sees it move. |

Together they replace the `Position2D`, `DrawableCircle2D`, `draw2D` and `move2D` that the CLI's
project template copies into `src/` today.

## Offered by kind of game

Not installed by default, so that a new project only shows what everyone needs:

| Kind of game                   | Packages                                                                                |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| Platformer                     | `@nanoforge/physics-2d`, `@nanoforge/controls-2d` (installs `combat-2d`)                |
| Top-down                       | `@nanoforge/controls-2d` (installs `physics-2d`, for walls)                             |
| Shooter                        | `@nanoforge/combat-2d`, `@nanoforge/controls-2d`                                        |
| Paddle games (pong, breakout)  | `@nanoforge/controls-2d` (installs `physics-2d`), and `@nanoforge/scenes-2d` for scores |
| Menus, scores, coins to pick   | `@nanoforge/scenes-2d`, `@nanoforge/controls-2d` (`Clickable2D` buttons)                |
| Multiplayer (server + clients) | `@nanoforge/network-2d`                                                                 |
| Any game with sound or music   | `@nanoforge/audio`                                                                      |
| 3D game                        | `@nanoforge/basics-3d`, `@nanoforge/graphics-3d` (instead of the 2D ones)               |

## Order of the systems

Systems run in the order they are added. With every package:

- **1a. Read the input.** On a client: `click2D`, `drag2D`, `readKeyboard2D`, `readGamepad2D`,
  `followMouse2D`, `muteSoundOnKey`, `muteMusicOnKey`; on a network client, also
  `syncFromServer2D`. On a server: the game's packet handlers, which write the intents.
- **1b. Act on the intents** (shared, not on a network client): `chaseNearest2D`,
  `shootAtNearest2D`, `walkAndJump2D`, `shoot2D`, then `showBullets2D` right after `shoot2D` on a
  client.
- **2.** `applyGravity2D`.
- **3.** `move2D`, `move3D`, `scrollLoop2D`, then `keepInBounds2D`.
- **4.** `detectCollisions2D`.
- **5.** `blockOnStaticBodies2D`, `deflectOnHit2D`, `addToVarOnEnter2D`, `collect2D`,
  `applyDamage2D`, `destroyOnHit2D`.
- **6. Once everything moved:** `follow2D`, `animateMoves2D`, `faceVelocity2D`, `faceTarget2D`,
  `faceAim2D`, `followCamera2D`, `animateSprites2D`, `colorOnHover2D`, `fadeOut2D`,
  `showSceneVars2D`.
- **7.** `draw2D`, so the screen shows where entities ended up, then `drawHealthBars2D`; in 3D,
  `draw3D`.
- **8. Last:** `expireLifetimes`; on a network server, `syncToClients2D`.

`loadSounds` and `playMusic` can go anywhere on the client.

Why some come first: `click2D` and `drag2D` run before the readers, so a click on a button doesn't
fire, and `readGamepad2D` after `readKeyboard2D`, so a pushed stick wins. `animateMoves2D` runs
before the facing systems, so their facing wins over its mirroring. `collect2D` runs after
`blockOnStaticBodies2D`, so a brick that is collected still bounces the ball, and `destroyOnHit2D`
after `applyDamage2D`, so a bullet hurts what it hits before it goes.

A network client runs none of 1b, nor the shared systems that remove entities (`expireLifetimes`,
`keepInBounds2D` in destroy mode, `collect2D`, `applyDamage2D`, `destroyOnHit2D`): the server
removes them, and the clients park them.
