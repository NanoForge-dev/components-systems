# components-systems

## Rôle

`@nanoforge-dev/components-systems` est un monorepo qui regroupe une collection de composants et de systèmes ECS (Entity-Component-System) génériques, réutilisables pour créer des jeux avec le moteur NanoForge. Chaque composant/système est publié comme un module installable individuellement via la CLI NanoForge (`nf install nf/position-2d`, `nf install nf/move-2d`, ...).

## Stack technique

- **Langage** : TypeScript (strict, decorators activés, ESNext, module resolution "Bundler")
- **Gestion de monorepo** : pnpm workspaces + pnpm catalogs (catégories `core`, `ci`, `lint`, `test` dans `pnpm-workspace.yaml`)
- **Build** : `tsc -b` (project references)
- **Tests** : Vitest (avec typecheck intégré via `tsconfig.spec.json` et coverage v8)
- **Lint/format** : ESLint (config partagée `@nanoforge-dev/utils-eslint-config`) + Prettier (plugin de tri des imports `@trivago/prettier-plugin-sort-imports`)
- **Git hooks** : Husky + lint-staged
- **Commits** : convention Conventional Commits (commitlint)
- **Changelog/release** : git-cliff
- **Node** : v25 requis (`.nvmrc`, `engines.node` dans `package.json`), pnpm 11.9.0 (`packageManager`)

### Dépendances NanoForge déclarées

Dépendances externes déclarées en devDependencies, résolues via le catalog pnpm `core` (versions centralisées dans `pnpm-workspace.yaml`) :

- `@nanoforge-dev/common`
- `@nanoforge-dev/ecs-lib`
- `@nanoforge-dev/ecs-server`
- `@nanoforge-dev/graphics-2d`
- `@nanoforge-dev/input`
- `@nanoforge-dev/network-client`
- `@nanoforge-dev/network-server`

`@nanoforge-dev/actions` est déclaré via le catalog `ci`.

## Structure du projet

```
components-systems/
├── packages/                          # 31 packages, un par composant ou système
│   ├── nf-position-2d.component/
│   │   ├── index.ts                   # classe du composant + export par défaut + EDITOR_COMPONENT_MANIFEST
│   │   └── nanoforge.manifest.json    # métadonnées (nom "nf/...", type, description, tags)
│   ├── nf-velocity-2d.component/
│   ├── nf-move-2d.system/
│   │   ├── index.ts                   # fonction système + EDITOR_SYSTEM_MANIFEST
│   │   └── nanoforge.manifest.json    # dépendances vers d'autres composants/systèmes
│   ├── nf-collision-2d.system/
│   └── ... (autres composants/systems : health, hitbox, gravity, damage, drawable, etc.)
├── test/
│   └── systems.spec.ts                # tests Vitest
├── .github/workflows/                 # tests.yml, release.yml, pr-triage.yml, issue-triage.yml, label-sync.yml
├── tsconfig.json                      # paths @components/* et @systems/* -> ./packages/*
├── vitest.config.ts
├── pnpm-workspace.yaml                # catalogs de dépendances partagées
└── package.json
```

Chaque package suit un schéma de nommage `nf-<nom>.component` ou `nf-<nom>.system`, sans `package.json` propre : ce sont de simples dossiers avec un `index.ts` et un `nanoforge.manifest.json`, consommés directement par l'outillage NanoForge (CLI/éditeur) plutôt que publiés individuellement sur npm.

### Pattern composant (`*.component`)

Une classe simple portant des données, avec :
- `export default NomDeClasse.name;` (requis pour la génération de code)
- `export const EDITOR_COMPONENT_MANIFEST` (typé `EditorComponentManifest` depuis `@nanoforge-dev/ecs-lib`) décrivant les paramètres pour l'éditeur visuel (type, nom, description, exemple, valeur par défaut)

Exemple (`nf-position-2d.component`) : une classe `Position2D { x: number; y: number }`.

### Pattern système (`*.system`)

Une fonction pure `(registry: Registry, ctx?: Context) => void` qui récupère les entités via `registry.getZipper([...Components])` ou `getIndexedZipper`, puis mute leurs composants. Accompagnée de :
- `export default nomFonction.name;`
- `export const EDITOR_SYSTEM_MANIFEST` (typé `EditorSystemManifest` depuis `@nanoforge-dev/ecs-lib`) listant les dépendances (noms de composants requis)

Exemple (`nf-move-2d.system`) : met à jour `Position2D` à partir de `Velocity2D` et du delta-temps (`ctx.app.delta`).

Chaque package possède aussi un `nanoforge.manifest.json` au format `{ name: "nf/<slug>", type: "component"|"system", description, tags, dependencies? }` qui sert à la CLI/registry NanoForge pour l'installation et la résolution de dépendances.

## Commandes principales

- `pnpm run build` → `tsc -b` (build incrémental via project references)
- `pnpm run test` (= `test:unit`) → `vitest run --config vitest.config.ts`
- `pnpm run lint` → `prettier --check .` + `eslint --format=pretty packages`
- `pnpm run format` → `prettier --write .` + `eslint --fix --format=pretty packages`
- `pnpm run changelog` → `git cliff --prepend ./CHANGELOG.md -u -c ./cliff.toml -r ./ --include-path './*'`

## Conventions

- Imports utilisant les alias `@components/*` et `@systems/*`, tous deux mappés vers `./packages/*` dans `tsconfig.json` et `vitest.config.ts`.
- Les composants/systèmes utilisés en interne (autres systèmes du même repo) s'importent via des chemins relatifs du type `../components/nf-position-2d.component` (chemin littéral utilisé dans les systèmes, ex. `nf-move-2d.system`, `nf-gravity-2d.system`, `nf-collision-2d.system`).
- Les tests (`test/systems.spec.ts`) importent via les alias `@systems/...`.
- Tags de catégorisation dans les manifests (ex. `"base"`, `"mouvement"`) pour le classement dans la CLI/registry/éditeur.
- Dépendances entre systèmes et composants déclarées explicitement dans `nanoforge.manifest.json` (champ `dependencies`), reflet des imports TypeScript réels.
- Convention de commit imposée par commitlint (Conventional Commits), vérifiée par un hook Husky.
