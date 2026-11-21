/**
 * Makes an entity collide as a circle whose center is its `Position2D`, plus its offset. Needs the
 * `detectCollisions2D` system.
 *
 * @remarks
 * `collisions` holds the ids of the entities it touched this frame, for your own systems. Blocking
 * (`blockOnStaticBodies2D`) and bounds (`keepInBounds2D`) treat it as its bounding square.
 *
 * @component
 * @side shared
 * @group Size color=#5ec26a - Size of the hitbox.
 * @group Advanced hidden - Where the hitbox is, from the Position2D.
 */
export class HitboxCircle2D {
  name = "HitboxCircle2D";

  /** Ids of the entities touching this one, filled by `detectCollisions2D`. */
  collisions: number[] = [];

  constructor(
    /** In pixels. @group Size */
    public radius = 25,
    /** Pixels from the `Position2D` to the center: half a `DrawableRect2D`'s width puts the circle in its middle. @group Advanced @preset vector.x */
    public offsetX = 0,
    /** Pixels from the `Position2D` to the center: half a `DrawableRect2D`'s height. @group Advanced @preset vector.y */
    public offsetY = 0,
  ) {}
}
