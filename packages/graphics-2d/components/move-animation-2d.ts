/**
 * Picks the animation of the entity's `SpriteAnimation2D` from how it moves: standing, walking,
 * jumping, falling. It also mirrors the sprite while it moves left. Needs `Velocity2D`,
 * `SpriteAnimation2D`, `DrawableRect2D` and the `animateMoves2D` system.
 *
 * @remarks
 * Rows are those of the sprite sheet, from 0 at the top. Draw the sprite looking right. A
 * `jumpRow` or `fallRow` of 0 or more means a side view, such as a platformer: only the horizontal
 * speed then makes it walk. For a top-down game, leave both at -1: moving up or down walks too.
 * Mirroring toward an aim without turning isn't covered yet: `FaceVelocity2D`, `FaceAim2D` and
 * `FaceTarget2D` turn the sprite, so turn `flip` off with them.
 *
 * @component
 * @side client
 * @group Rows color=#b18cff - The animation of each move.
 * @group Facing color=#e86fb0 - Which way the sprite looks.
 */
export class MoveAnimation2D {
  name = "MoveAnimation2D";

  constructor(
    /** While it stands still. @group Rows */
    public idleRow = 0,
    /** While it moves. @group Rows */
    public walkRow = 1,
    /** In the air going up, and falling too while `fallRow` is -1; -1 for none. @group Rows */
    public jumpRow = -1,
    /** While it falls; -1 uses `jumpRow`. @group Rows */
    public fallRow = -1,
    /** Mirrored while it moves left; turn it off with `FaceVelocity2D`, `FaceAim2D` or `FaceTarget2D`. @group Facing */
    public flip = true,
  ) {}
}
