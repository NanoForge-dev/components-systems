/**
 * Where an entity is, in pixels of the world: the screen's without a `Camera2D`, and always the
 * screen's for a `Hud2D` entity.
 *
 * @remarks
 * For rectangles it is their top-left corner, for circles their center.
 *
 * @component
 * @side shared
 * @group Position color=#4aa3ff - Pixels from the top-left corner of the world.
 */
export class Position2D {
  name = "Position2D";

  constructor(
    /** Pixels from the left edge. @group Position @preset vector.x */
    public x = 0,
    /** Pixels from the top edge. @group Position @preset vector.y */
    public y = 0,
  ) {}
}
