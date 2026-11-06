# @nanoforge/physics-2d

- `HitboxRect2D`, `HitboxCircle2D` with `detectCollisions2D`: each hitbox's `collisions` lists the
  ids of the entities it touches.
- `RigidBody2D` with `applyGravity2D`: falls. Add `blockOnStaticBodies2D` so it stands on
  `StaticBody2D` entities (walls, floors, one-way platforms) and knows when it is `grounded`.

Blocking works between `HitboxRect2D` entities. Order: `applyGravity2D`, `move2D`,
`detectCollisions2D`, `blockOnStaticBodies2D`.
