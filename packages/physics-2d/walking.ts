import type { RigidBody2D } from "./components/rigid-body-2d";
import type { WalkAndJump2D } from "./components/walk-and-jump-2d";

/**
 * The axes whose velocity `walkAndJump2D` sets for `walker`: x unless its `axes` is `vertical`, and
 * y unless its `axes` is `horizontal` or its `RigidBody2D` has a gravity, which owns the vertical
 * velocity. `chaseNearest2D` aims on the same axes.
 */
export const walkedAxes = (
  walker: WalkAndJump2D,
  body: RigidBody2D | undefined,
): { x: boolean; y: boolean } => ({
  x: walker.axes !== "vertical",
  y: walker.axes !== "horizontal" && (body?.gravity ?? 0) === 0,
});
