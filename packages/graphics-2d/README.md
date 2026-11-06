# @nanoforge/graphics-2d

Draws entities that have a `Position2D`: add `draw2D` after the systems that move them.

- `DrawableRect2D`, `DrawableCircle2D`: a color, or an image from the project's assets.
- `DrawableText2D`: change its `text` from a system to show a score.

A killed entity's shape is removed from the screen by `draw2D`. For anything the parameters don't
offer, use the Konva node in `shape` from code.
