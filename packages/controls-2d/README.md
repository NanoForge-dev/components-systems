# @nanoforge/controls-2d

- `MoveController2D` with `moveControl2D`: arrow keys (or any keys) set the velocity. Set `axes` to
  `horizontal` for a platformer.
- `JumpController2D` with `jumpControl2D`: jumps from the ground, with double jumps, coyote time and
  jump buffering. Needs `RigidBody2D` from `@nanoforge/physics-2d`.

Add them before `move2D`.
