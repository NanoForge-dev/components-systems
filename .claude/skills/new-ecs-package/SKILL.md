---
name: new-ecs-package
description: Scaffold a new ECS component or system in this repo (components-systems), following exactly the pattern of existing packages. Use when the user asks to add a new NanoForge component or system in this repo.
---

# New ECS component / system

Each package under `packages/` is a plain folder (no `package.json` of its own) containing `index.ts` + `nanoforge.manifest.json`. No centralized registration step is needed: `tsconfig.json`/`vitest.config.ts` already map `@components/*` and `@systems/*` to `./packages/*`, and `tsconfig.json` includes `packages/**/*.ts` — a new folder is automatically picked up.

Before creating a package, check that one doesn't already exist under a similar name (`ls packages/ | grep -i <keyword>`).

## Component (`*.component`)

Folder `packages/nf-<kebab-name>.component/`, `index.ts` file:

```ts
import { type EditorComponentManifest } from "@nanoforge-dev/ecs-lib";

export class ClassName {
  name = this.constructor.name;

  constructor(
    public fieldA: number,
    public fieldB: number,
  ) {}
}

// * Required to generate code
export default ClassName.name;

// * Required for the editor to display the component and generate code
export const EDITOR_COMPONENT_MANIFEST: EditorComponentManifest = {
  name: "ClassName",
  description: "<short description, third person, in English like the other manifests>",
  params: [
    {
      type: "number",
      name: "fieldA",
      description: "<field description>",
      example: 0,
      default: 0,
    },
    // one object per constructor field
  ],
};
```

And `nanoforge.manifest.json` alongside it:

```json
{
  "name": "nf/<kebab-name>",
  "type": "component",
  "description": "<same description>",
  "tags": ["<tag1>", "<tag2>"]
}
```

Real reference: `packages/nf-position-2d.component/`.

## System (`*.system`)

Folder `packages/nf-<kebab-name>.system/`, `index.ts` file:

```ts
import { type Context } from "@nanoforge-dev/common";
import { type EditorSystemManifest, type Registry } from "@nanoforge-dev/ecs-lib";

import { ComponentA } from "../components/nf-component-a.component";
import { ComponentB } from "../components/nf-component-b.component";

export function functionName(registry: Registry, ctx: Context) {
  const entities = registry.getZipper([ComponentA, ComponentB]);

  entities.forEach(({ ComponentA, ComponentB }) => {
    // system logic
  });
}

// * Required to generate code
export default functionName.name;

// * Required for the editor to display the system and generate code
export const EDITOR_SYSTEM_MANIFEST: EditorSystemManifest = {
  name: "functionName",
  description: "<short description>",
  dependencies: ["ComponentA", "ComponentB"],
};
```

Note: the components used are imported via a relative path (`../components/nf-xxx.component`), not via the `@components/*` alias — this is the convention observed in all existing systems (e.g. `nf-move-2d.system`).

And `nanoforge.manifest.json`:

```json
{
  "name": "nf/<kebab-name>",
  "type": "system",
  "description": "<same description>",
  "tags": ["<tag1>", "<tag2>"],
  "dependencies": ["nf/<component-a>", "nf/<component-b>"]
}
```

Real reference: `packages/nf-move-2d.system/`.

## After creation

1. Suggest adding a test in `test/systems.spec.ts` (imported via the `@systems/nf-<name>.system` alias), without forcing it — it's a file shared across all systems, to be edited carefully so as not to break existing tests.
2. Run `pnpm run lint` and `pnpm run build` to verify that the new package compiles and complies with the repo's ESLint/Prettier rules before proposing a commit.
3. Never publish or modify `pnpm-workspace.yaml` as part of this skill — adding a component/system requires no additional dependency beyond those already present in the `core` catalog.
