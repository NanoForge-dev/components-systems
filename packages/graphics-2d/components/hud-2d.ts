/**
 * Draws the entity on the screen instead of in the world: a `Camera2D` doesn't move it, and it is
 * drawn over the world. For scores, health and buttons. Needs a drawable and the `draw2D` system.
 *
 * @remarks
 * Its `Position2D` is then in pixels from the top-left corner of the screen, whatever the camera
 * shows.
 *
 * @component
 * @side client
 */
export class Hud2D {
  name = "Hud2D";
}
