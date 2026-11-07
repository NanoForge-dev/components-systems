# Default packages

The packages the editor should install when it creates a new project. The editor doesn't install
any yet (project creation runs `nf new` only): this is the list to use once it does, and the one to
install by hand meanwhile.

## Installed by default

| Package                  | Why                                                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `@nanoforge/basics`      | Every game has entities that are somewhere and move. `Position2D` is also what the Scene screen uses to place entities.       |
| `@nanoforge/graphics-2d` | Without it nothing is on screen. With `basics`, a beginner places a colored rectangle, gives it a velocity, and sees it move. |

Together they replace the `Position2D`, `DrawableCircle2D`, `draw2D` and `move2D` that the CLI's
project template copies into `src/` today.

## Offered by kind of game

Not installed by default, so that a new project only shows what everyone needs:

| Kind of game | Packages                                                         |
| ------------ | ---------------------------------------------------------------- |
| Platformer   | `@nanoforge/physics-2d`, `@nanoforge/controls-2d`                |
| Top-down     | `@nanoforge/controls-2d`, `@nanoforge/physics-2d` (for walls)    |
| Shooter      | `@nanoforge/combat-2d` (installs `physics-2d` and `graphics-2d`) |

## Order of the systems

Systems run in the order they are added. With every package:

1. `moveControl2D`, `jumpControl2D`, `shootControl2D`: read the keys
2. `applyGravity2D`
3. `move2D`
4. `detectCollisions2D`
5. `blockOnStaticBodies2D`, `applyDamage2D`, `destroyOnHit2D`
6. `draw2D`: last, so the screen shows where entities ended up
