---
name: new-ecs-package
description: Add an ECS component or system to one of this repo's registry packages (packages/basics, combat-2d, controls-2d, graphics-2d, physics-2d), or create a new package for a new group, the way the existing ones are written. Use when asked to add a NanoForge component, system or package in components-systems.
---

# New component, system or package

Read `AGENTS.md` first. Reference package: `packages/basics`.

## 0. Pick the package

- Check that the item doesn't exist: `grep -rn "class <Name>\|function <name>\|const <name> =" packages`.
- Put it in the package whose README matches what it does. A new package only for a new group of
  items that a game would install together (like `controls-2d`).
- An item may use another package's items only if that package doesn't already depend on this one
  (`dependencies` in the manifests): `basics` ← `physics-2d` ← `controls-2d`, `combat-2d`.

## 1. A component

`packages/<pkg>/components/<kebab-name>.ts`, one class per file:

```ts
/**
 * <What it is, in one sentence. What else it needs: `OtherComponent`, the `someSystem` system.>
 *
 * @component
 * @side shared
 * @group Main color=#4aa3ff - <What these parameters set.>
 * @group Advanced hidden - Less common settings.
 */
export class MyThing2D {
  name = "MyThing2D";

  constructor(
    /** <Unit and meaning.> @group Main */
    public speed = 100,
    /** <Unit and meaning.> @group Advanced */
    public visible = true,
  ) {}
}
```

- `name` is a literal equal to the class name: the ECS registry keys on it.
- Every constructor parameter is `public`, has a default and an inline doc: they are the
  inspector's fields. A string literal union (`"both" | "horizontal"`) becomes a choice, an engine
  enum (`InputEnum`) too.
- `@side client` when it uses graphics or input, `shared` otherwise.
- Layout tags: `@group <Name>` on each parameter, `@preset vector.x|vector.y|size.width|size.height|color`,
  `@asset .png .jpg` for a file of the project's assets. Examples: `packages/basics/components/position-2d.ts`,
  `packages/graphics-2d/components/drawable-rect-2d.ts`.
- State a system writes at runtime (not set in the editor) is a field outside the constructor, with
  its doc (`collisions` in `packages/physics-2d/components/hitbox-rect-2d.ts`).

## 2. A system

`packages/<pkg>/systems/<kebab-name>.ts`, one arrow function per file (team rule, workspace ADR 0009; the systems already on main predate
it and stay as they are):

```ts
import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import { Velocity2D } from "@nanoforge/basics/components/velocity-2d";

import { MyThing2D } from "../components/my-thing-2d";

/**
 * <What it does to which entities. Where it goes: before `move2D`, after `detectCollisions2D`...>
 *
 * @system
 * @side shared
 */
export const myThing2D = (registry: Registry, ctx: Context) => {
  const seconds = ctx.app.delta / 1000;

  registry.getZipper([MyThing2D, Velocity2D]).forEach(({ MyThing2D, Velocity2D }) => {
    Velocity2D.x += MyThing2D.speed * seconds;
  });
};
```

- Same package: relative import (`../components/…`). Other package: `@nanoforge/<pkg>/components/<file>`.
- Drop `ctx` if unused (`noUnusedParameters`), like `detectCollisions2D(registry)`.
- `ctx.app.delta` is in milliseconds.
- Code shared by several items goes in a file at the package root (`collisions.ts`), as exported
  arrow functions: every export under `components/` or `systems/` is read as an item.

## 3. Register it

Nothing in code: the manifest's `contents` already points at `components/` and `systems/`, and
`tsconfig.json` builds `packages/**/*.ts`. Update by hand:

- `packages/<pkg>/README.md`: one line for the item (and with which system it works);
- a new system: its place in _Order of the systems_ in `docs/default-packages.md`, and the order
  line of the package README if it has one;
- `packages/<pkg>/nanoforge.manifest.json`: only if the new code imports a package or an engine lib
  not listed yet: `@nanoforge/<pkg>` in `dependencies` (`"^2.0.0"`), `@nanoforge-dev/<lib>` in
  `libDependencies`. Never touch `version`: the release PR bumps it from the commits.

## 4. A new package

`packages/<new-name>/` (kebab-case, `-2d` suffix for 2D), with `components/`, `systems/`, a
`README.md` and this `nanoforge.manifest.json` (no `version`: the first release makes it `1.0.0`):

```json
{
  "type": "package",
  "name": "@nanoforge/<new-name>",
  "description": "<What a game gets from it, in one sentence.>",
  "keywords": ["<new-name>", "2d", "<keyword>"],
  "license": "MIT",
  "suggestedPlugins": ["@nanoforge/ecs"],
  "dependencies": { "@nanoforge/basics": "^2.0.0" },
  "libDependencies": { "@nanoforge-dev/common": "^2.0.0", "@nanoforge-dev/ecs": "^2.0.0" },
  "contents": [
    { "kind": "@nanoforge/ecs:component", "path": "components/" },
    { "kind": "@nanoforge/ecs:system", "path": "systems/" }
  ]
}
```

- `dependencies`: the `@nanoforge/*` packages its files import, nothing else (drop the key if
  none, like `basics`). Each must be a folder of `packages/`, or the release fails.
- `libDependencies`: the `@nanoforge-dev/*` libs its files import, at the `core` catalog range.
  A lib not in the `core` catalog is a new dependency: ask first.
- README: `# @nanoforge/<new-name>`, then one line per item, like `packages/physics-2d/README.md`.
- Add its row to the table of the root `README.md` (and of `AGENTS.md`), and to
  `docs/default-packages.md` if a kind of game should get it.

## 5. Test it

The 70% coverage thresholds cover every `packages/**/*.ts`: a new item comes with a test.

- A system: in `test/systems.spec.ts`, in the `describe` of its package (add one for a new
  package). Spawn entities with `spawn(...)`, `registry.addSystem(mySystem)`, `run(frame(ms))`,
  then check the components. Held keys go in `keys`, the mouse in `mouse`.
- A graphics item: in `test/graphics.spec.ts`, which stubs `document` and uses `fakeLayer()`.
- Import with the alias: `@nanoforge/<pkg>/systems/<file>`.

## 6. Check and commit

```sh
pnpm run format && pnpm run build && pnpm run lint && pnpm run test
```

`format` first: prettier realigns the README tables and wraps long lines, which a hand edit rarely
gets right. Commit with the package as scope and the type that sets
the release bump: `feat(<pkg>): add <item>` (minor), `fix(<pkg>): …` (patch). Never publish, and
never edit `pnpm-workspace.yaml` for an item.
