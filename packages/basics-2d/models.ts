import type { Registry } from "@nanoforge-dev/ecs";

import { Model } from "./components/model";
import { taggedIds } from "./tags";

/**
 * Marks an entity made from a model: `model` is the model's `Tag` word. `shoot2D` adds it to its
 * bullets, and `showBullets2D` gives the entities that have it the model's look. A runtime-only
 * component, kept out of `components/` so the editor doesn't offer it.
 */
export class FromModel {
  name = "FromModel";

  constructor(
    /** The `Tag` word of the model the entity came from. */
    public model = "",
  ) {}
}

/** The id of the first entity tagged `word` that has a `Model`, or `undefined`. */
export const modelOf = (registry: Registry, word: string): number | undefined =>
  taggedIds(registry, word).find(
    (id) => registry.getEntityComponent(registry.entityFromIndex(id), Model) !== undefined,
  );

/** The `typeof` of the values `copyOf` copies. */
const COPIED = new Set(["number", "string", "boolean", "undefined"]);

/**
 * A new component of the same class as `component`, with its number, string, boolean, `undefined`
 * and `null` fields; object fields (a shape, `collisions`, a `Map`) stay as the class makes them.
 * Copy from a `Model`, which no system changes.
 */
export const copyOf = <T extends object>(component: T): T => {
  const copy = new (component.constructor as new () => T)();
  for (const [key, value] of Object.entries(component))
    if (value === null || COPIED.has(typeof value)) Reflect.set(copy, key, value);
  return copy;
};
