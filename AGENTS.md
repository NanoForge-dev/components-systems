# components-systems

## Role

`@nanoforge-dev/components-systems` is a monorepo that gathers a collection of generic, reusable ECS (Entity-Component-System) components and systems for building games with the NanoForge engine. Each component/system is published as a module that can be installed individually via the NanoForge CLI (`nf install nf/position-2d`, `nf install nf/move-2d`, ...).

## Tech Stack

- **Language**: TypeScript (strict, decorators enabled, ESNext, "Bundler" module resolution)
- **Monorepo management**: pnpm workspaces + pnpm catalogs (`core`, `ci`, `lint`, `test` categories in `pnpm-workspace.yaml`)
- **Build**: `tsc -b` (project references)
- **Tests**: Vitest (with integrated typechecking via `tsconfig.spec.json` and v8 coverage)
- **Lint/format**: ESLint (shared config `@nanoforge-dev/utils-eslint-config`) + Prettier (import-sorting plugin `@trivago/prettier-plugin-sort-imports`)
- **Git hooks**: Husky + lint-staged
- **Commits**: Conventional Commits convention (commitlint)
- **Changelog/release**: git-cliff
- **Node**: v25 required (`.nvmrc`, `engines.node` in `package.json`), pnpm 11.9.0 (`packageManager`)

### Declared NanoForge dependencies

External dependencies declared as devDependencies, resolved via the pnpm `core` catalog (versions centralized in `pnpm-workspace.yaml`):

- `@nanoforge-dev/common`
- `@nanoforge-dev/ecs-lib`
- `@nanoforge-dev/ecs-server`
- `@nanoforge-dev/graphics-2d`
- `@nanoforge-dev/input`
- `@nanoforge-dev/network-client`
- `@nanoforge-dev/network-server`

`@nanoforge-dev/actions` is declared via the `ci` catalog.

## Project Structure

```
components-systems/
├── packages/                          # 31 packages, one per component or system
│   ├── nf-position-2d.component/
│   │   ├── index.ts                   # component class + default export + EDITOR_COMPONENT_MANIFEST
│   │   └── nanoforge.manifest.json    # metadata (name "nf/...", type, description, tags)
│   ├── nf-velocity-2d.component/
│   ├── nf-move-2d.system/
│   │   ├── index.ts                   # system function + EDITOR_SYSTEM_MANIFEST
│   │   └── nanoforge.manifest.json    # dependencies on other components/systems
│   ├── nf-collision-2d.system/
│   └── ... (other components/systems: health, hitbox, gravity, damage, drawable, etc.)
├── test/
│   └── systems.spec.ts                # Vitest tests
├── .github/workflows/                 # tests.yml, release.yml, pr-triage.yml, issue-triage.yml, label-sync.yml
├── tsconfig.json                      # @components/* and @systems/* paths -> ./packages/*
├── vitest.config.ts
├── pnpm-workspace.yaml                # shared dependency catalogs
└── package.json
```

Each package follows an `nf-<name>.component` or `nf-<name>.system` naming scheme, with no `package.json` of its own: they are plain folders containing an `index.ts` and a `nanoforge.manifest.json`, consumed directly by the NanoForge tooling (CLI/editor) rather than published individually to npm.

### Component pattern (`*.component`)

A simple data-holding class, with:
- `export default ClassName.name;` (required for code generation)
- `export const EDITOR_COMPONENT_MANIFEST` (typed as `EditorComponentManifest` from `@nanoforge-dev/ecs-lib`) describing the parameters for the visual editor (type, name, description, example, default value)

Example (`nf-position-2d.component`): a `Position2D { x: number; y: number }` class.

### System pattern (`*.system`)

A pure function `(registry: Registry, ctx?: Context) => void` that retrieves entities via `registry.getZipper([...Components])` or `getIndexedZipper`, then mutates their components. Accompanied by:
- `export default functionName.name;`
- `export const EDITOR_SYSTEM_MANIFEST` (typed as `EditorSystemManifest` from `@nanoforge-dev/ecs-lib`) listing the dependencies (names of required components)

Example (`nf-move-2d.system`): updates `Position2D` from `Velocity2D` and the delta-time (`ctx.app.delta`).

Each package also has a `nanoforge.manifest.json` in the format `{ name: "nf/<slug>", type: "component"|"system", description, tags, dependencies? }`, used by the NanoForge CLI/registry for installation and dependency resolution.

## Main Commands

- `pnpm run build` → `tsc -b` (incremental build via project references)
- `pnpm run test` (= `test:unit`) → `vitest run --config vitest.config.ts`
- `pnpm run lint` → `prettier --check .` + `eslint --format=pretty packages`
- `pnpm run format` → `prettier --write .` + `eslint --fix --format=pretty packages`
- `pnpm run changelog` → `git cliff --prepend ./CHANGELOG.md -u -c ./cliff.toml -r ./ --include-path './*'`

## Conventions

- Imports use the `@components/*` and `@systems/*` aliases, both mapped to `./packages/*` in `tsconfig.json` and `vitest.config.ts`.
- Components/systems used internally (by other systems in the same repo) are imported via relative paths such as `../components/nf-position-2d.component` (the literal path used in systems, e.g. `nf-move-2d.system`, `nf-gravity-2d.system`, `nf-collision-2d.system`).
- Tests (`test/systems.spec.ts`) import via the `@systems/...` aliases.
- Categorization tags in the manifests (e.g. `"base"`, `"mouvement"`) for classification in the CLI/registry/editor.
- Dependencies between systems and components are declared explicitly in `nanoforge.manifest.json` (the `dependencies` field), mirroring the actual TypeScript imports.
- Commit convention enforced by commitlint (Conventional Commits), checked by a Husky hook.
