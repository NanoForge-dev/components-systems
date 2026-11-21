import type { Registry } from "@nanoforge-dev/ecs";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { taggedIds } from "@nanoforge/basics-2d/tags";
import { centerOf, nearest } from "@nanoforge/physics-2d/collisions";

import { Health } from "../components/health";
import { Owner } from "../components/owner";
import { Shoot2D } from "../components/shoot-2d";
import { ShootAtNearest2D } from "../components/shoot-at-nearest-2d";

/** An entity it can aim at, by the middle of its hitbox. */
interface Candidate {
  id: number;
  x: number;
  y: number;
}

/**
 * Aims the `Shoot2D` of each `ShootAtNearest2D` entity at the nearest entity tagged with its
 * `target` (any `Health` when the target is empty) within its `range`, and sets `fire`; with
 * none, it holds fire and keeps the aim. Add it before `walkAndJump2D` and `shoot2D`.
 *
 * @remarks
 * It aims from the middle of its hitbox to the middle of the target's, and leaves out itself, its
 * `Owner`, entities without a `Position2D` and a `Health` at 0.
 *
 * @system
 * @side shared
 */
export const shootAtNearest2D = (registry: Registry) => {
  // The candidates of each target word, found once per frame.
  const candidates = new Map<string, Candidate[]>();
  const candidatesFor = (word: string): Candidate[] => {
    let found = candidates.get(word);
    if (found) return found;
    const ids =
      word === ""
        ? registry.getIndexedZipper([Health]).map(({ id }) => id as number)
        : taggedIds(registry, word);
    found = [];
    for (const id of ids) {
      const entity = registry.entityFromIndex(id);
      const position: Position2D | undefined = registry.getEntityComponent(entity, Position2D);
      const health: Health | undefined = registry.getEntityComponent(entity, Health);
      if (position && !(health && health.current <= 0))
        found.push({ id, ...centerOf(registry, entity, position) });
    }
    candidates.set(word, found);
    return found;
  };

  registry
    .getIndexedZipper([ShootAtNearest2D, Shoot2D, Position2D])
    .forEach(({ id, Shoot2D, Position2D }) => {
      const shoot = Shoot2D as Shoot2D;
      const entity = registry.entityFromIndex(id);
      const owner: Owner | undefined = registry.getEntityComponent(entity, Owner);
      const from = centerOf(registry, entity, Position2D as Position2D);
      const target = nearest(
        from,
        candidatesFor(shoot.target).filter(
          (other) => other.id !== id && other.id !== owner?.entity,
        ),
        shoot.range,
      );
      shoot.fire = target !== undefined;
      if (!target) return;
      shoot.aimX = target.x - from.x;
      shoot.aimY = target.y - from.y;
    });
};
