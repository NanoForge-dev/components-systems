# components-systems

## Role

NanoForge's official component and system packages for the editor, made for Engine v3. Each folder
of `packages/` is one package of the NanoForge registry (`@nanoforge/<name>`), installed into a
project's `nf_modules/@nanoforge/<name>` from the editor (**File › Packages…**). They are not npm
packages: the root `package.json` is private and `pnpm-workspace.yaml` lists no workspace packages.

| Package                  | Side   | What it gives                                                                                            |
| ------------------------ | ------ | -------------------------------------------------------------------------------------------------------- |
| `@nanoforge/basics-2d`   | shared | Position, velocity and `move2D`; tags, models, lifetimes, following another entity                       |
| `@nanoforge/basics-3d`   | shared | `Position3D`, `Rotation3D`, `Scale3D`, `Velocity3D`, `Acceleration3D` and `move3D`                       |
| `@nanoforge/graphics-2d` | client | Shapes and texts with a color or an image, sprite animations, facing, a camera, a HUD, `draw2D`          |
| `@nanoforge/graphics-3d` | client | Boxes, spheres and planes of a color, lights, a camera, any Three.js object, `draw3D`                    |
| `@nanoforge/physics-2d`  | shared | Hitboxes, collisions, gravity, walls, bounces and deflectors, walking, jumping, chasing and bounds       |
| `@nanoforge/controls-2d` | client | Keyboard, mouse and gamepad controls for walking, jumping and shooting; click, drag and follow the mouse |
| `@nanoforge/combat-2d`   | both   | Health, damage, shooters fired by a player, a turret or the server; health bars                          |
| `@nanoforge/scenes-2d`   | both   | Scene vars shown in texts, coins and zones that add to them                                              |
| `@nanoforge/network-2d`  | both   | The server sends where its entities are, how they move and which are gone; the clients follow            |
| `@nanoforge/audio`       | client | Sound effects, music per level, a mute key                                                               |

## Stack

- TypeScript, strict, built with `tsc -b` in two programs: `tsconfig.json` (`packages/**/*.ts`
  but graphics-3d) and `tsconfig.3d.json` (the graphics-3d packages).
- Engine libs from the `core` catalog of `pnpm-workspace.yaml`: `@nanoforge-dev/common`,
  `@nanoforge-dev/ecs`, `@nanoforge-dev/graphics-2d`, `@nanoforge-dev/input`,
  `@nanoforge-dev/scene`, `@nanoforge-dev/sound`, `@nanoforge-dev/music`, `@nanoforge-dev/network`,
  `@nanoforge-dev/graphics-3d` (all `^3.0.0`), and `three` (`^0.187.0`, graphics-3d's peer).
  `@nanoforge-dev/editor-lib` is there only for the typings of `scene`, `sound`, `music` and
  `network`, which import it.
- Vitest, in a `2d` and a `3d` project, and v8 coverage on `packages/**/*.ts`. Vitest typechecks
  nothing: `pnpm run typecheck` (in `lint`) runs `tsc` on `tsconfig.spec.json` and
  `tsconfig.spec.3d.json`, which cover the packages and the specs of each program, libs included,
  so a program that loads both graphics libs fails (TS2717).
- ESLint and Prettier from the shared `@nanoforge-dev/utils-eslint-config` and
  `@nanoforge-dev/utils-prettier-config` (double quotes, trailing commas, 100 columns, sorted
  imports).
- Husky: `commit-msg` runs commitlint (conventional commits), `pre-commit` runs lint-staged,
  `pre-push` runs `pnpm run lint`.
- Node 26 (`engines`, `.nvmrc`), pnpm 11.9.0 (`packageManager`).

## Layout

```
packages/<name>/
├── nanoforge.manifest.json   # the registry package: name, version, dependencies, contents
├── README.md                 # one line per item, and where its systems go in the order
├── components/<kebab>.ts     # one component class per file
├── systems/<kebab>.ts        # one system function per file
└── <helper>.ts               # shared code that is not an item (collisions.ts, image-fill.ts...)
test/
├── ecs.ts                    # the ECS registry, `spawn`, `runOn`, `useRegistry`: no engine typings
├── helpers.ts                # re-exports ecs.ts; the fake ctx (`fake`, `frame`), `run`, `useEcs`
├── <name>.spec.ts            # one per package: its items, on a real ECS registry
├── recipes.spec.ts           # the READMEs' recipes end to end, across packages
└── 3d/                       # specs of the graphics-3d packages: they import ecs.ts, not helpers.ts
docs/default-packages.md      # packages a new project gets, and the order of every system
```

## Commands

```sh
pnpm run build      # tsc -b tsconfig.json tsconfig.3d.json
pnpm run lint       # prettier --check . && eslint --format=pretty packages && typecheck
pnpm run typecheck  # tsc --noEmit on tsconfig.spec.json and tsconfig.spec.3d.json
pnpm run format     # prettier --write . && eslint --fix --format=pretty packages
pnpm run test       # = test:unit: vitest, fails under 70% lines, functions, branches or statements
```

CI (`.github/workflows/tests.yml`, `nanoforge-dev/actions` v3) runs `lint` and `test:unit` on pull
requests to `main`.

## Items: TSDoc in the source

There is no per-item manifest and no `EDITOR_COMPONENT_MANIFEST` / `EDITOR_SYSTEM_MANIFEST`: the
editor reads each item from its `.ts` file (NanoForge-dev/editor
`docs/adr/0003-component-and-system-docs.md`). Reference: `packages/basics-2d`.

- **Component:** a class tagged `@component`, with a field `name = "<ClassName>"` (the ECS registry
  keys on it) and `public` constructor parameters with defaults. The parameters are the fields of
  the editor's inspector; their types and defaults are read from the code.
- **System:** `export const <camelName> = (registry: Registry, ctx: Context) => …` tagged `@system`
  (new code uses arrow functions; the systems already on main are `export function`, and the editor
  reads both). Drop `ctx` when the system doesn't use it (`detectCollisions2D`). Queries go through
  `registry.getZipper([A, B])`; the editor infers them, and the `ctx.<lib>` it uses.
- **`@side`:** `client` for what uses graphics or input, or runs only on a client
  (`syncFromServer2D`), `shared` for the rest, `server` for what
  runs only on a server (`syncToClients2D`). Default `shared`.
- **Docs:** the summary says what it does and what it needs (other components, the system to add);
  `@remarks` and `@example` add detail. Constructor parameters have an inline `/** … */` doc, at
  least their `@group` (`KeyboardControls2D`'s keys have only that).
- **Inspector layout:** on the class, `@group <Name> [color=<css>] [hidden] - <description>`; on a
  parameter, `@group <Name>`, `@preset vector.x|vector.y|size.width|size.height|color`,
  `@asset .png .jpg …` for a project file, `@label <text>`, `@color <css>`, `@hidden`. Less common
  parameters go in `@group Advanced hidden`.
- Every export of a file under `components/` or `systems/` is an item: shared code goes in a file at
  the package root (`packages/physics-2d/collisions.ts`), exported as arrow functions.

## Imports and dependencies

- Inside a package, relative paths: `import { Position2D } from "../components/position-2d"`.
- Another package, by its name and a file path, through the `@nanoforge/*` → `./packages/*` alias
  (`tsconfig.json` `paths`, `vitest.config.ts` `resolve.alias`):
  `import { Position2D } from "@nanoforge/basics-2d/components/position-2d"`. A project resolves the
  same path in `nf_modules/@nanoforge/<name>`.
- Engine libs: `import type { Registry } from "@nanoforge-dev/ecs"`, `type` when only types are
  used.
- A system that reads `ctx.input` or `ctx.graphics` imports the lib: a bare
  `import "@nanoforge-dev/input";` or `import "@nanoforge-dev/graphics-2d";` (`click-2d.ts`,
  `draw-2d.ts`), or a value it uses (`InputEnum` in `read-keyboard-2d.ts`). It adds their fields to
  `Context`, and the editor reads an item's required libs from its imports. Same for
  `ctx.controller` (`@nanoforge-dev/input/controller`), `ctx.scenes`, `ctx.sound` and `ctx.music`.
- `ctx.network` is the exception: `@nanoforge-dev/network/client` and `/server` both declare it,
  with other types, so one program can't import both. `network-2d` imports `PacketDefinition`
  from the root and types the part of `ctx.network` it uses (`sync-to-clients-2d.ts`).
- `ctx.graphics` is declared by both graphics-2d and graphics-3d, with other types, so one program
  can't load both (TS2717); a game never does. The packages that use graphics-3d build apart: they
  are in `tsconfig.3d.json` and out of `tsconfig.json`, and their specs are in `test/3d/`
  (`tsconfig.spec.3d.json`, the `3d` Vitest project). A package never imports both graphics libs.
  `draw3D` imports `@nanoforge-dev/graphics-3d` like `draw2D` imports graphics-2d; every
  graphics-3d component file imports `@nanoforge-dev/graphics-3d/three`, even a bare `import`, so
  the editor offers it only to 3D apps.
- Mouse positions are on the screen: an item placed in the world converts them with `toWorld` or
  `pointFor` (`graphics-2d/world.ts`), so it works under a `Camera2D` and on `Hud2D` entities.
- `nanoforge.manifest.json` mirrors the imports: each `@nanoforge/<pkg>` used goes in `dependencies`
  at the dependency's current major (`^<its manifest major>.0.0`, e.g.
  `{ "@nanoforge/basics-2d": "^2.0.0" }`; `^1.0.0` for a manifest without a `version`), each engine lib
  in `libDependencies` at its `core` catalog range. `controls-2d` and `scenes-2d` also list
  `@nanoforge-dev/graphics-2d`, which they use through graphics-2d's items: the mouse items read
  the camera through `pointFor`, and `showSceneVars2D` writes a `DrawableText2D`.

## Registering a new item

Nothing to register in code: every manifest's `contents` points at the folders
(`{ "kind": "@nanoforge/ecs:component", "path": "components/" }` and `…:system` on `systems/`), and
`tsconfig.json` builds every `packages/**/*.ts` but the graphics-3d ones, which `tsconfig.3d.json`
builds (a new 3D package goes in the `include` of `tsconfig.3d.json` and `tsconfig.spec.3d.json`,
and in the `exclude` of `tsconfig.json` and `tsconfig.spec.json`). By hand:

- the package's `README.md`: one line for the item;
- a new system: its place in _Order of the systems_ in `docs/default-packages.md`, and in its
  package README;
- a new package: a row in the root `README.md` table (and in the table above).

The skill `.claude/skills/new-ecs-package` walks through it.

## Tests

- `test/helpers.ts` loads the server ECS (`EcsLibrary` from `@nanoforge-dev/ecs/server`, its wasm
  from `node_modules`) once per spec file (`useEcs()`), and clears the systems, the entities and
  `fake` before each test. A test spawns entities (`spawn`), adds systems, sets what the player
  does in `fake`, and runs frames made by `frame(ms)` (`run(frame(16))`): fake `ctx.app.delta`,
  `ctx.input` (`keys`, `mouse` with `deltaX`/`deltaY` and `focus`, `drag`), `ctx.controller`
  (`left`/`right` `sticks`, `buttons`), `ctx.graphics` (a stage and a `baseLayer` that records the
  camera), `ctx.scenes.vars` (`vars`), `ctx.sound` and `ctx.music` (spies), and one
  `ctx.network` per test (`sent`, `sentTo`, `sentToServer`, `received`). `frame(ms, ["controller"])`
  leaves a library out.
- One `test/<name>.spec.ts` per package, and `test/recipes.spec.ts` for the recipes that cross
  packages. A spec file whose tests make Konva shapes calls `stubDocument()`, so they run without a
  canvas. A system's module state (`click2D`'s buttons, `draw2D`'s shapes, a warning flag) lasts the
  whole spec file.
- Import from the packages with the `@nanoforge/*` alias. The 70% thresholds apply to all of
  `packages/**/*.ts`: a new item comes with its test. Vitest typechecks nothing (only
  `*.spec-d.ts` files, and there are none): `pnpm run typecheck` does.
- A graphics-3d spec goes in `test/3d/` and imports `../ecs`: `helpers.ts` loads graphics-2d's
  typings (its fake Konva layers), which type `ctx.graphics` for 2D.

## Releases

The registry release runs from CI (`nanoforge-dev/actions` v3), never by hand:

1. dispatch **NanoForge Registry Release PR** (`nf-registry-release-pr.yml`): it bumps the `version`
   of each manifest from the conventional commits that touched its folder since its last release
   (`feat` minor, `fix`/`perf` patch, `!` or `BREAKING CHANGE` major; `docs`, `chore` none);
2. merge its `nf-releases/*` PR: `nf-registry-release.yml` publishes what it bumped.

Both steps are a maintainer's action: an agent never dispatches the workflow or merges the PR, it
tells the user.

So never edit a `version` by hand. A new package's manifest has no `version`: its first release is
`1.0.0`. A manifest `version` that has no git tag and is not on the registry is published as it is,
whatever the commits say (the action's `plan.ts`, "not on the registry yet"): so the first release
keeps each `2.0.0`. After a release, a break raises the version, and the dependents' ranges must be
raised in that release PR. Every `dependencies` entry must be a package of `packages/`, or the
release fails.

## Conventions

- Files in kebab-case (`move-2d.ts`), components in PascalCase with the `2D` suffix for 2D ones
  (`Velocity2D`), systems in camelCase (`move2D`).
- Systems run every frame: query only the components they need.
- Intents: what an entity is told to do is a public field of the logic component that acts on it,
  named after the action: `WalkAndJump2D.moveX`/`moveY` (-1 to 1), `Shoot2D.fire` and
  `aimX`/`aimY` (a direction), and one-shot `<verb>Requested` (`jumpRequested`, `fireRequested`).
  A device reader, an AI or the server's packet handler writes them; held ones are never cleared,
  and a `<verb>Requested` is cleared by the system that reads it. The device components
  (`KeyboardControls2D`, `GamepadControls2D`) keep what they read, for a network sender.
- Models: an entity with a `Model` and a `Tag` is a template, not part of the game. A spawner finds
  it by its word (`modelOf`) and copies a known list of its components (`copyOf`), and marks the
  copy `FromModel` (`basics-2d/models.ts`). `expireLifetimes`, `fadeOut2D` and `animateSprites2D`
  skip models, so copies start fresh.
- Runtime-only components, which the editor must not offer (`FromModel`), live in a helper file at
  the package root, not in `components/`.
- Only shape components (`Drawable*`, `Hitbox*`, `Box3D`, `Sphere3D`, `Plane3D`) take `width`,
  `height`, `depth` or `radius`, and only position and vector components (`Position2D`,
  `Velocity2D`, `Acceleration2D`, the 3D ones) take a numeric `x`/`y`: the editor's Scene screen
  places an entity by its first numeric `x`/`y`, and draws a shape for any `radius` or `width` and
  `height`. Name the others for what they are (`offsetX`, `aimX`, `moveX`, `jumpHeight`,
  `barWidth`, `areaWidth`, `worldWidth`).
- Commits: conventional commits (`@commitlint/config-conventional`), lowercase subject, the package
  as scope when the change is in one (`feat(physics-2d): …`). The commit type sets the release bump.
  Never `--no-verify`.
