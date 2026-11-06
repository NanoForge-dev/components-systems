/** A rectangle by its top-left corner and size, in pixels. */
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A circle by its center and radius, in pixels. */
export interface Round {
  x: number;
  y: number;
  radius: number;
}

/** Whether two rectangles overlap (touching edges don't). */
export const boxesOverlap = (a: Box, b: Box): boolean =>
  a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

/** Whether two circles overlap (touching edges don't). */
export const roundsOverlap = (a: Round, b: Round): boolean =>
  Math.hypot(a.x - b.x, a.y - b.y) < a.radius + b.radius;

/** Whether a rectangle and a circle overlap (touching edges don't). */
export const boxRoundOverlap = (box: Box, round: Round): boolean => {
  const nearestX = Math.min(Math.max(round.x, box.x), box.x + box.width);
  const nearestY = Math.min(Math.max(round.y, box.y), box.y + box.height);
  return Math.hypot(round.x - nearestX, round.y - nearestY) < round.radius;
};
