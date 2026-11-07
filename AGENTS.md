# components-systems

## Role

NanoForge's official component and system packages for the editor, made for Engine v2. Each folder
of `packages/` is one package of the NanoForge registry (`@nanoforge/<name>`), installed into a
project's `nf_modules/@nanoforge/<name>` from the editor (**File › Packages…**). They are not npm
packages: the root `package.json` is private and `pnpm-workspace.yaml` lists no workspace packages.

| Package                  | Side   | What it gives                                                    |
| ------------------------ | ------ | ---------------------------------------------------------------- |
| `@nanoforge/basics`      | shared | `Position2D`, `Velocity2D`, `Acceleration2D` and `move2D`        |
| `@nanoforge/graphics-2d` | client | Rectangles, circles and texts with a color or an image, `draw2D` |
| `@nanoforge/physics-2d`  | shared | Hitboxes, collisions, gravity, walls and platforms               |
| `@nanoforge/controls-2d` | client | Move and jump with the keyboard                                  |
| `@nanoforge/combat-2d`   | both   | Health, damage, bullets fired at the mouse                       |

## Stack

- TypeScript, strict, built with `tsc -b` (`tsconfig.json` includes `packages/**/*.ts`).
- Engine libs from the `core` catalog of `pnpm-workspace.yaml`: `@nanoforge-dev/common`,
  `@nanoforge-dev/ecs`, `@nanoforge-dev/graphics-2d`, `@nanoforge-dev/input` (all `^2.0.0`).
- Vitest with typechecking (`tsconfig.spec.json`) and v8 coverage on `packages/**/*.ts`.
- ESLint and Prettier from the shared `@nanoforge-dev/utils-eslint-config` and
  `@nanoforge-dev/utils-prettier-config` (double quotes, trailing commas, 100 columns, sorted
  imports).
- Husky: `commit-msg` runs commitlint (conventional commits), `pre-commit` runs lint-staged,
  `pre-push` runs `pnpm run lint`.
- Node 25 (`engines`, `.nvmrc`), pnpm 11.9.0 (`packageManager`).

## Layout

```
packages/<name>/
├── nanoforge.manifest.json   # the registry package: name, version, dependencies, contents
├── README.md                 # one line per item, and where its systems go in the order
├── components/<kebab>.ts     # one component class per file
├── systems/<kebab>.ts        # one system function per file
└── <helper>.ts               # shared code that is not an item (collisions.ts, image-fill.ts...)
test/
├── systems.spec.ts           # every system, on a real ECS registry
└── graphics.spec.ts          # graphics-2d drawables and imageFill, with a fake DOM
docs/default-packages.md      # packages a new project gets, and the order of every system
```

## Commands

```sh
pnpm run build      # tsc -b
pnpm run lint       # prettier --check . && eslint --format=pretty packages
pnpm run format     # prettier --write . && eslint --fix --format=pretty packages
pnpm run test       # = test:unit: vitest, fails under 70% lines, functions, branches or statements
```

CI (`.github/workflows/tests.yml`, `nanoforge-dev/actions` v3) runs `lint` and `test:unit` on pull
requests to `main`.

## Items: TSDoc in the source

There is no per-item manifest and no `EDITOR_COMPONENT_MANIFEST` / `EDITOR_SYSTEM_MANIFEST`: the
editor reads each item from its `.ts` file (NanoForge-dev/editor
`docs/adr/0003-component-and-system-docs.md`). Reference: `packages/basics`.

- **Component:** a class tagged `@component`, with a field `name = "<ClassName>"` (the ECS registry
  keys on it) and `public` constructor parameters with defaults. The parameters are the fields of
  the editor's inspector; their types and defaults are read from the code.
- **System:** `export const <camelName> = (registry: Registry, ctx: Context) => …` tagged `@system`
  (new code uses arrow functions; the systems already on main are `export function`, and the editor
  reads both). Drop `ctx` when the system doesn't use it (`detectCollisions2D`). Queries go through
  `registry.getZipper([A, B])`; the editor infers them, and the `ctx.<lib>` it uses.
- **`@side`:** `client` for what uses graphics or input, `shared` for the rest (`server` exists too,
  unused here). Default `shared`.
- **Docs:** the summary says what it does and what it needs (other components, the system to add);
  `@remarks` and `@example` add detail. Constructor parameters have an inline `/** … */` doc, at
  least their `@group` (`MoveController2D`'s keys have only that).
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
  `import { Position2D } from "@nanoforge/basics/components/position-2d"`. A project resolves the
  same path in `nf_modules/@nanoforge/<name>`.
- Engine libs: `import type { Registry } from "@nanoforge-dev/ecs"`, `type` when only types are
  used.
- A system that reads `ctx.input` or `ctx.graphics` has a bare `import "@nanoforge-dev/input";` or
  `import "@nanoforge-dev/graphics-2d";` (`move-control-2d.ts`, `draw-2d.ts`): it adds their fields
  to `Context`, and the editor reads an item's required libs from its imports.
- `nanoforge.manifest.json` mirrors the imports: each `@nanoforge/<pkg>` used goes in `dependencies`
  at the dependency's current major (`^<its manifest major>.0.0`); `^1.0.0` for a package never
  released (`{ "@nanoforge/basics": "^2.0.0" }`), each engine lib in `libDependencies` at its `core`
  catalog range. `combat-2d` also lists `@nanoforge-dev/graphics-2d`, which it uses through
  `DrawableCircle2D`.

## Registering a new item

Nothing to register in code: every manifest's `contents` points at the folders
(`{ "kind": "@nanoforge/ecs:component", "path": "components/" }` and `…:system` on `systems/`), and
`tsconfig.json` builds every `packages/**/*.ts`. By hand:

- the package's `README.md`: one line for the item;
- a new system: its place in _Order of the systems_ in `docs/default-packages.md`, and in its
  package README;
- a new package: a row in the root `README.md` table (and in the table above).

The skill `.claude/skills/new-ecs-package` walks through it.

## Tests

- `test/systems.spec.ts` loads the server ECS (`EcsLibrary` from `@nanoforge-dev/ecs/server`, its
  wasm from `node_modules`), then each test spawns entities, adds systems and runs frames made by
  `frame(ms)` (fake `ctx.app.delta` and `ctx.input`). One `describe` per package.
- `test/graphics.spec.ts` stubs `document` and uses a fake layer, so drawables run without a canvas.
- Import from the packages with the `@nanoforge/*` alias. The 70% thresholds apply to all of
  `packages/**/*.ts`: a new item comes with its test.

## Releases

The registry release runs from CI (`nanoforge-dev/actions` v3), never by hand:

1. dispatch **NanoForge Registry Release PR** (`nf-registry-release-pr.yml`): it bumps the `version`
   of each manifest from the conventional commits that touched its folder since its last release
   (`feat` minor, `fix`/`perf` patch, `!` or `BREAKING CHANGE` major; `docs`, `chore` none);
2. merge its `nf-releases/*` PR: `nf-registry-release.yml` publishes what it bumped.

Both steps are a maintainer's action: an agent never dispatches the workflow or merges the PR, it
tells the user.

So never edit a `version` by hand. A new package's manifest has no `version`: its first release is
`1.0.0`. Every `dependencies` entry must be a package of `packages/`, or the release fails.

## Conventions

- Files in kebab-case (`move-2d.ts`), components in PascalCase with the `2D` suffix for 2D ones
  (`Velocity2D`), systems in camelCase (`move2D`).
- Systems run every frame: query only the components they need.
- Commits: conventional commits (`@commitlint/config-conventional`), lowercase subject, the package
  as scope when the change is in one (`feat(physics-2d): …`). The commit type sets the release bump.
  Never `--no-verify`.
