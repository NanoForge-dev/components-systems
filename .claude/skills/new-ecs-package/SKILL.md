---
name: new-ecs-package
description: Scaffold un nouveau composant ou system ECS dans ce repo (components-systems), en suivant exactement le pattern des packages existants. À utiliser quand l'utilisateur demande d'ajouter un nouveau composant ou system NanoForge dans ce repo.
---

# Nouveau composant / system ECS

Chaque package de `packages/` est un simple dossier (pas de `package.json` propre) contenant `index.ts` + `nanoforge.manifest.json`. Aucune étape d'enregistrement centralisé n'est nécessaire : `tsconfig.json`/`vitest.config.ts` mappent déjà `@components/*` et `@systems/*` vers `./packages/*`, et `tsconfig.json` inclut `packages/**/*.ts` — un nouveau dossier est automatiquement pris en compte.

Avant de créer un package, vérifier qu'il n'existe pas déjà sous un nom proche (`ls packages/ | grep -i <mot-clé>`).

## Composant (`*.component`)

Dossier `packages/nf-<nom-kebab>.component/`, fichier `index.ts` :

```ts
import { type EditorComponentManifest } from "@nanoforge-dev/ecs-lib";

export class NomDeClasse {
  name = this.constructor.name;

  constructor(
    public champA: number,
    public champB: number,
  ) {}
}

// * Required to generate code
export default NomDeClasse.name;

// * Required for the editor to display the component and generate code
export const EDITOR_COMPONENT_MANIFEST: EditorComponentManifest = {
  name: "NomDeClasse",
  description: "<description courte, à la 3e personne, en anglais comme les autres manifests>",
  params: [
    {
      type: "number",
      name: "champA",
      description: "<description du champ>",
      example: 0,
      default: 0,
    },
    // un objet par champ du constructeur
  ],
};
```

Et `nanoforge.manifest.json` à côté :

```json
{
  "name": "nf/<nom-kebab>",
  "type": "component",
  "description": "<même description>",
  "tags": ["<tag1>", "<tag2>"]
}
```

Référence réelle : `packages/nf-position-2d.component/`.

## System (`*.system`)

Dossier `packages/nf-<nom-kebab>.system/`, fichier `index.ts` :

```ts
import { type Context } from "@nanoforge-dev/common";
import { type EditorSystemManifest, type Registry } from "@nanoforge-dev/ecs-lib";

import { ComposantA } from "../components/nf-composant-a.component";
import { ComposantB } from "../components/nf-composant-b.component";

export function nomFonction(registry: Registry, ctx: Context) {
  const entities = registry.getZipper([ComposantA, ComposantB]);

  entities.forEach(({ ComposantA, ComposantB }) => {
    // logique du system
  });
}

// * Required to generate code
export default nomFonction.name;

// * Required for the editor to display the system and generate code
export const EDITOR_SYSTEM_MANIFEST: EditorSystemManifest = {
  name: "nomFonction",
  description: "<description courte>",
  dependencies: ["ComposantA", "ComposantB"],
};
```

Note : l'import des composants utilisés se fait en chemin relatif (`../components/nf-xxx.component`), pas via l'alias `@components/*` — c'est la convention observée dans tous les systems existants (ex. `nf-move-2d.system`).

Et `nanoforge.manifest.json` :

```json
{
  "name": "nf/<nom-kebab>",
  "type": "system",
  "description": "<même description>",
  "tags": ["<tag1>", "<tag2>"],
  "dependencies": ["nf/<composant-a>", "nf/<composant-b>"]
}
```

Référence réelle : `packages/nf-move-2d.system/`.

## Après la création

1. Proposer d'ajouter un test dans `test/systems.spec.ts` (import via l'alias `@systems/nf-<nom>.system`), sans l'imposer — c'est un fichier partagé entre tous les systems, à éditer avec attention pour ne pas casser les tests existants.
2. Lancer `pnpm run lint` et `pnpm run build` pour valider que le nouveau package compile et respecte les règles ESLint/Prettier du repo avant de proposer un commit.
3. Ne jamais publier ou modifier `pnpm-workspace.yaml` dans le cadre de ce skill — l'ajout d'un composant/system ne nécessite aucune dépendance supplémentaire au-delà de celles déjà présentes dans le catalog `core`.
