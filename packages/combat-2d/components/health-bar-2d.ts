import { type Layer, Rect } from "@nanoforge-dev/graphics-2d";

/**
 * Shows a bar with how much of a `Health` is left: the entity's own, over it, or that of the
 * entity tagged `target`. Needs `Position2D` and the `drawHealthBars2D` system.
 *
 * @remarks
 * Without a `target`, the bar is centered over the entity's hitbox, or its `DrawableRect2D` or
 * `DrawableCircle2D`. With one, the bar's top-left corner is at this entity's `Position2D`: add
 * `Hud2D` for a bar on the screen, such as the player's health in a corner.
 *
 * @example
 * The player's health in a corner: `Position2D(20, 20)`, `Hud2D` and
 * `new HealthBar2D(200, 16, 0, "#5ec26a", "#3a3a3a", "player")`.
 *
 * @component
 * @side client
 * @group Bar color=#e5484d - Size and place of the bar, and whose health it shows.
 * @group Look color=#b18cff - Its colors.
 */
export class HealthBar2D {
  name = "HealthBar2D";

  /** The whole bar on screen, made by `drawHealthBars2D` the first time it draws it. */
  back?: Rect;
  /** The part of the bar showing the health left. */
  fill?: Rect;

  constructor(
    /** In pixels. @group Bar @preset size.width */
    public barWidth = 40,
    /** In pixels. @group Bar @preset size.height */
    public barHeight = 6,
    /** Pixels between the bar and the top of the entity. @group Bar */
    public gap = 6,
    /** A CSS color, for the health left. @group Look @preset color */
    public fillColor = "#5ec26a",
    /** A CSS color, for the health lost. @group Look @preset color */
    public backColor = "#3a3a3a",
    /** The `Tag` of the entity whose `Health` it shows, with the bar's top-left corner at this entity's `Position2D` (add `Hud2D` for a bar on the screen); empty: its own, over it. @group Bar */
    public target = "",
  ) {}

  /** Puts the bar on `layer` with its top-left corner at (`x`, `y`), `left` (0 to 1) of it full. */
  draw(layer: Layer, x: number, y: number, left: number): void {
    this.back ??= new Rect();
    this.fill ??= new Rect();
    if (this.back.getParent() !== layer) layer.add(this.back);
    if (this.fill.getParent() !== layer) layer.add(this.fill);
    this.back.setAttrs({
      x,
      y,
      width: this.barWidth,
      height: this.barHeight,
      fill: this.backColor,
    });
    this.fill.setAttrs({
      x,
      y,
      width: this.barWidth * left,
      height: this.barHeight,
      fill: this.fillColor,
    });
  }

  /** Removes the bar from the screen. */
  destroy(): void {
    this.back?.destroy();
    this.fill?.destroy();
    this.back = undefined;
    this.fill = undefined;
  }
}
