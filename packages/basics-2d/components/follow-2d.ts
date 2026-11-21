/**
 * Keeps the entity on another one, the first entity whose `Tag` is `target`, at an offset: a name
 * over a player, a weapon in its hand, a ball resting on a paddle. Needs `Position2D` and the
 * `follow2D` system.
 *
 * @remarks
 * With a `lag`, it glides after the target instead of sticking to it.
 *
 * @component
 * @side shared
 * @group Target color=#4aa3ff - What it follows.
 * @group Offset color=#5ec26a - Where it stays, from the target's position.
 * @group Advanced hidden - Less common settings.
 */
export class Follow2D {
  name = "Follow2D";

  constructor(
    /** The `Tag` of the entity to follow. @group Target */
    public target = "player",
    /** Pixels to the right of the target's position. @group Offset @preset vector.x */
    public offsetX = 0,
    /** Pixels below the target's position. @group Offset @preset vector.y */
    public offsetY = 0,
    /** How slowly it glides after the target, in seconds: 0 sticks to it, 0.2 trails it a little. @group Advanced */
    public lag = 0,
  ) {}
}
