import type { Registry } from "@nanoforge-dev/ecs";

import { Tag } from "./components/tag";

/** The words of a `Tag`, separated by spaces. */
const wordsOf = (tag: Tag): string[] => tag.value.trim().split(/\s+/);

/** Ids of the entities whose `Tag` has the word `word`; none for an empty word. */
export const taggedIds = (registry: Registry, word: string): number[] =>
  word === ""
    ? []
    : registry
        .getIndexedZipper([Tag])
        .filter(({ Tag }) => wordsOf(Tag as Tag).includes(word))
        .map(({ id }) => id as number);

/**
 * Whether the `Tag` of the entity of id `id` has the word `word`; never for an empty word, nor for
 * an entity removed earlier in the frame (still listed in the hitboxes' `collisions`).
 */
export const hasTag = (registry: Registry, id: number, word: string): boolean => {
  // By id: registry.entityFromIndex throws for an entity removed earlier in the frame.
  const tag = registry.getComponents(Tag).get(id) as Tag | undefined;
  return word !== "" && tag !== undefined && tag !== null && wordsOf(tag).includes(word);
};
