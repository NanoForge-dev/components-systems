import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import { Lifetime } from "@nanoforge/basics-2d/components/lifetime";
import { Model } from "@nanoforge/basics-2d/components/model";

import { FadeOut2D } from "../components/fade-out-2d";
import { drawableOf } from "../drawable-of";

/**
 * Lowers the opacity of each `FadeOut2D` entity's drawable to 0 in `seconds`: the last seconds of
 * its `Lifetime` when it has one (all of it when the `Lifetime` is shorter), else its first seconds
 * of fading. Add it before `draw2D`.
 *
 * @remarks
 * It never removes the entity: its `Lifetime` does, with `expireLifetimes`. A `Model` doesn't
 * fade, so its copies start at its opacity.
 *
 * @system
 * @side client
 */
export const fadeOut2D = (registry: Registry, ctx: Context) => {
  const seconds = ctx.app.delta / 1000;

  registry.getIndexedZipper([FadeOut2D]).forEach(({ id, FadeOut2D }) => {
    const fade = FadeOut2D as FadeOut2D;
    const entity = registry.entityFromIndex(id);
    const drawable = drawableOf(registry, entity);
    if (!drawable || registry.getEntityComponent(entity, Model)) return;
    if (Number.isNaN(fade.from)) fade.from = drawable.opacity;
    else fade.elapsed += seconds;

    const lifetime: Lifetime | undefined = registry.getEntityComponent(entity, Lifetime);
    const left = lifetime ? lifetime.left : fade.seconds - fade.elapsed;
    const span = lifetime ? Math.min(fade.seconds, lifetime.seconds) : fade.seconds;
    const share = span > 0 ? Math.min(1, Math.max(0, left / span)) : 0;
    drawable.opacity = fade.from * share;
  });
};
