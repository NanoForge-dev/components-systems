/**
 * Walks the entity toward the nearest entity tagged `target` within `range`: an enemy chasing the
 * player. It fills its `WalkAndJump2D`'s `moveX`/`moveY` every frame, and stops it when none is in
 * range. Needs `WalkAndJump2D`, `Position2D` and the `chaseNearest2D` system.
 *
 * @remarks
 * It walks straight at the target, so walls stop it (no path finding). Under gravity, or with its
 * `WalkAndJump2D`'s `axes` set to one axis, it heads for the target's side at full speed: a
 * platformer enemy doesn't slow down when the player jumps. Distances are between hitbox middles.
 *
 * @example
 * A slow enemy after the player: `new WalkAndJump2D(100)` and `new ChaseNearest2D()`, with a
 * `Tag("player")` on the player.
 *
 * @component
 * @side shared
 * @group Chase color=#e5484d - What it chases.
 */
export class ChaseNearest2D {
  name = "ChaseNearest2D";

  constructor(
    /** The `Tag` of what it chases. @group Chase */
    public target = "player",
    /** Pixels it sees; 0: any distance. @group Chase */
    public range = 0,
  ) {}
}
