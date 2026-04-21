import { type Context } from "@nanoforge-dev/common";
import { type EditorSystemManifest, type Registry } from "@nanoforge-dev/ecs-lib";
import { type Graphics2DLibrary } from "@nanoforge-dev/graphics-2d";

import { DrawableCircle2D } from "../components/nf-drawable-circle-2d.component";
import { DrawableRect2D } from "../components/nf-drawable-rect-2d.component";
import { DrawableText2D } from "../components/nf-drawable-text-2d.component";
import { Position2D } from "../components/nf-position-2d.component";

export function draw2D(registry: Registry, ctx: Context) {
  const graphic2d = ctx.libs.getGraphics<Graphics2DLibrary>();

  const entities = [
    ...registry.getZipper([Position2D, DrawableCircle2D]),
    ...registry.getZipper([Position2D, DrawableRect2D]),
    ...registry.getZipper([Position2D, DrawableText2D]),
  ];

  entities.forEach(({ Position2D, DrawableCircle2D, DrawableRect2D, DrawableText2D }) => {
    (DrawableCircle2D ?? DrawableRect2D ?? DrawableText2D).addToLayer(graphic2d.baseLayer);
    (DrawableCircle2D ?? DrawableRect2D ?? DrawableText2D).shape.setPosition(Position2D);
  });
}
// * Required to generate code
export default draw2D.name;

// * Required for the editor to display the system and generate code
export const EDITOR_SYSTEM_MANIFEST: EditorSystemManifest = {
  name: "draw2D",
  description: "Draw every drawable component",
  dependencies: ["Position2D", "DrawableCircle2D", "DrawableRect2D", "DrawableText2D"],
};
