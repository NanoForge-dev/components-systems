import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";

import { Acceleration3D } from "../components/acceleration-3d";
import { Position3D } from "../components/position-3d";
import { Velocity3D } from "../components/velocity-3d";

/**
 * Moves entities: their `Acceleration3D` changes their `Velocity3D`, then their `Velocity3D`
 * changes their `Position3D`, by the time elapsed since the last frame.
 *
 * @system
 * @side shared
 */
export const move3D = (registry: Registry, ctx: Context) => {
  const seconds = ctx.app.delta / 1000;

  registry.getZipper([Acceleration3D, Velocity3D]).forEach(({ Acceleration3D, Velocity3D }) => {
    Velocity3D.x += Acceleration3D.x * seconds;
    Velocity3D.y += Acceleration3D.y * seconds;
    Velocity3D.z += Acceleration3D.z * seconds;
  });
  registry.getZipper([Position3D, Velocity3D]).forEach(({ Position3D, Velocity3D }) => {
    Position3D.x += Velocity3D.x * seconds;
    Position3D.y += Velocity3D.y * seconds;
    Position3D.z += Velocity3D.z * seconds;
  });
};
