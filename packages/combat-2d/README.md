# @nanoforge/combat-2d

- `Health`: killed at 0. `DamageDealer` with `applyDamage2D` hurts what it starts touching.
- `DestroyOnHit2D` with `destroyOnHit2D`: killed as soon as it touches something.
- `Owner`: what an entity belongs to is never hurt nor destroys it.
- `ShootController2D` with `shootControl2D`: fires bullets toward the mouse.

Add `applyDamage2D` then `destroyOnHit2D` after `detectCollisions2D`.
