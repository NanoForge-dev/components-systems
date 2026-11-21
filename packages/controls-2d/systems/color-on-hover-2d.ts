import type { Registry } from "@nanoforge-dev/ecs";
import { drawableOf } from "@nanoforge/graphics-2d/drawable-of";

import { Clickable2D } from "../components/clickable-2d";
import { ColorOnHover2D } from "../components/color-on-hover-2d";

/**
 * Colors the drawable of each `ColorOnHover2D` entity while its `Clickable2D` is hovered, and gives
 * its color back after. Add it after `click2D` and the systems that move entities, before `draw2D`.
 *
 * @system
 * @side client
 */
export const colorOnHover2D = (registry: Registry) => {
  registry
    .getIndexedZipper([ColorOnHover2D, Clickable2D])
    .forEach(({ id, ColorOnHover2D, Clickable2D }) => {
      const hover = ColorOnHover2D as ColorOnHover2D;
      const drawable = drawableOf(registry, registry.entityFromIndex(id));
      if (!drawable) return;
      if ((Clickable2D as Clickable2D).hovered) {
        // A color set meanwhile (on a click) becomes the one to give back.
        if (drawable.fillColor !== hover.color) hover.normalColor = drawable.fillColor;
        drawable.fillColor = hover.color;
      } else if (hover.normalColor !== undefined) {
        drawable.fillColor = hover.normalColor;
        hover.normalColor = undefined;
      }
    });
};
