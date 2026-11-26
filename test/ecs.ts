import type { Context, InitContext } from "@nanoforge-dev/common";
import { EcsLibrary, type Registry } from "@nanoforge-dev/ecs/server";
import { beforeAll, beforeEach } from "vitest";

/*
 * The ECS part of the helpers, without any engine lib's typings: 3D specs (`test/3d/`) import it
 * directly, since `helpers.ts` loads graphics-2d's, which type `ctx.graphics` for 2D.
 */

/** The server ECS registry, booted by `useRegistry` before the first test of the file. */
export let registry: Registry;

/** Spawns an entity with `components`. */
export const spawn = (...components: { name: string }[]) => {
  const entity = registry.spawnEntity();
  for (const component of components) registry.addComponent(entity, component);
  return entity;
};

/** Runs every system once, on `ctx`. */
export const runOn = (ctx: Context) => registry.runSystems(ctx);

/** Whether the entity still exists, by one of its components. */
export const alive = (
  component: Parameters<Registry["getComponents"]>[0],
  entity: { getId(): number },
) => registry.getComponents(component).get(entity.getId()) !== undefined;

/**
 * Boots the server ECS (its wasm from `node_modules`) before the first test of the file, and
 * clears its systems and entities before each test. Call it once, at the top of the file.
 */
export const useRegistry = () => {
  beforeAll(async () => {
    const ecs = new EcsLibrary();
    await ecs.__init({
      files: new Map([
        ["/libecs.wasm", "./node_modules/@nanoforge-dev/ecs/dist/server/libecs.wasm"],
      ]),
    } as unknown as InitContext);
    registry = ecs.registry;
  });

  beforeEach(() => {
    registry.clearSystems();
    registry.clearEntities();
  });
};
