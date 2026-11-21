# @nanoforge/graphics-2d

Draws entities that have a `Position2D`: add `draw2D` after the systems that move them.

- `DrawableRect2D`, `DrawableCircle2D`: a color, or an image from the project's assets. A rectangle
  can also show a crop of its image, tile the whole image (`repeat`, which ignores the crop) and be mirrored (`flipX`). It turns and is
  mirrored around its center, so it stays on its hitbox, and its `shape.x()` and `shape.y()` are
  that center: read its corner from `Position2D`. Turn `rotateAroundCenter` off to turn it around
  its top-left corner.
- `DrawableText2D`: change its `text` from a system to show a score.
- `SpriteAnimation2D` with `animateSprites2D`: plays a sprite sheet on a rectangle, one row per
  animation; `rowFrames` when the rows have different frame counts.
- `MoveAnimation2D` with `animateMoves2D`: picks the animation (stand, walk, jump, fall) from the
  velocity, and mirrors the sprite going left. A `jumpRow` or `fallRow` makes it a side view.
- `Camera2D` with `followCamera2D`: the view follows the entity, or the one tagged `target`, inside
  the world's edges. On an entity of its own, the view stays where it is when the target is gone.
- `Hud2D`: drawn on the screen over the world, where the camera doesn't move it.
- `ScrollLoop2D` with `scrollLoop2D`: endless grounds, backgrounds and parallax.
- `FadeOut2D` with `fadeOut2D`: fades the drawable out, over the last seconds of its `Lifetime`
  when it has one. It never removes the entity: its `Lifetime` does.
- `FaceVelocity2D` with `faceVelocity2D`: turns the drawable toward where it moves.
- `FaceTarget2D` with `faceTarget2D`: turns the drawable toward the entity tagged `target`, such as
  eyes following the player.

The facing items take the way the image is drawn looking (`imageFacing`), and `keepUpright`
mirrors a rectangle drawn looking right or left instead of turning it upside down. With a
`MoveAnimation2D`, turn its `flip` off.

`animateSprites2D` and `fadeOut2D` leave models alone (`Model`, from `@nanoforge/basics-2d`), so
their copies start on their first frame, at the model's opacity.

## Order

`scrollLoop2D` with `move2D`. Then, once everything moved and before `draw2D`: `animateMoves2D`,
`faceVelocity2D`, `faceTarget2D`, `followCamera2D`, `animateSprites2D`, `fadeOut2D`.
`animateMoves2D` comes before the facing systems, so their facing wins over its mirroring.

## Recipes

- A floating "+10", spawned from code: `Position2D`, `DrawableText2D("+10")`,
  `Velocity2D(0, -40)`, `Lifetime(1)` and `FadeOut2D()`. Systems: `move2D`, `fadeOut2D`, `draw2D`,
  then `expireLifetimes`, which removes it.
- An animated platformer character: add `SpriteAnimation2D` and `MoveAnimation2D` to its
  `DrawableRect2D`. Systems: `animateMoves2D`, `animateSprites2D`, before `draw2D`.
- Eyes that follow the player: `Position2D`, a drawable and `FaceTarget2D()`; the player has
  `Tag("player")`. To face the mouse, add a cursor entity with `Position2D`, `FollowMouse2D` (from
  `@nanoforge/controls-2d`) and `Tag("cursor")`, and use `FaceTarget2D("cursor")`. Systems:
  `followMouse2D`, `faceTarget2D`, `draw2D`.
- A camera on an entity of its own: `Camera2D(1, 0.1, 0, 0, 0, 0, "player")`. Systems:
  `followCamera2D`, then `draw2D`.

A killed entity's shape is removed from the screen by `draw2D`. For anything the parameters don't
offer, use the Konva node in `shape` from code.
