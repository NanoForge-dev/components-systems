import "@nanoforge-dev/graphics-3d/three";

/**
 * Lights the scene. Add `draw3D`; place it with `Position3D` (basics-3d).
 *
 * @remarks
 * Until the scene has a light, `draw3D` adds a default one, so shapes are never black.
 *
 * - `ambient`: lights everything evenly, from nowhere.
 * - `directional`: parallel rays like the sun, from its position toward the origin; from
 *   `(5, 10, 7)` until it has a `Position3D`.
 * - `point`: shines all around from its position, like a bulb; it fades with the distance.
 *
 * @component
 * @side client
 * @group Light color=#feca57 - Kind, color and strength.
 */
export class Light3D {
  name = "Light3D";

  constructor(
    /** How it shines. @group Light */
    public kind: "ambient" | "directional" | "point" = "directional",
    /** Any CSS color. @group Light @preset color */
    public color = "#ffffff",
    /** How strong it is: about 1 for ambient, 3 for the sun, more for a point light. @group Light */
    public intensity = 3,
  ) {}
}
