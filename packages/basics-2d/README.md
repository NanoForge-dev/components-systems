# @nanoforge/basics-2d

Where an entity is and how it moves, in 2D.

- `Position2D`: pixels in the world, which are the screen's without a camera: a rectangle's
  top-left corner, a circle's center.
- `Velocity2D`: pixels per second.
- `Acceleration2D`: pixels per second, per second.
- `move2D`: applies acceleration to velocity, then velocity to position.
- `Tag`: words other items find the entity by, such as `player` or `enemy`, or several separated
  by spaces (`player p2`). `taggedIds` and `hasTag` (`tags.ts`) match one word.
- `Lifetime` with `expireLifetimes`: removes the entity after some seconds. Add the system last, and
  not on a network client. It leaves models alone.
- `Follow2D` with `follow2D`: stays on the entity with a given `Tag`, at an offset, or glides after
  it. Add the system after the ones that move entities.
- `Model`: makes the entity a template that spawners copy, such as a bullet's look and hitbox, not
  part of the game. Give it a `Tag` naming it and no `Position2D`. Spawners use `models.ts`:
  `modelOf` finds a model by its word, `copyOf` copies one of its components, and `FromModel` marks
  what was made from it.
