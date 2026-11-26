import type { Context } from "@nanoforge-dev/common";
import { BoxGeometry, type Group, Mesh, MeshBasicMaterial } from "@nanoforge-dev/graphics-3d/three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { disposeObject3D } from "./object-3d";

/**
 * Loads the `.glb`/`.gltf` model at `path` into `group`, in the background: it never blocks and
 * never throws. A missing or broken file logs an error and puts a magenta box in the group.
 *
 * @remarks
 * Call it after the group is in the scene: a load that ends once the group has no parent (its
 * component was removed) adds nothing and disposes what it loaded.
 */
export const loadModel3D = (group: Group, path: string, assets: Context["assets"]) =>
  Promise.resolve()
    .then(() => new GLTFLoader().loadAsync(assets.getAsset(path).path))
    .then(({ scene }) => (group.parent ? group.add(scene) : disposeObject3D(scene)))
    .catch((error: unknown) => {
      console.error(`No 3D model at "${path}":`, error);
      if (group.parent)
        group.add(new Mesh(new BoxGeometry(), new MeshBasicMaterial({ color: "#ff00ff" })));
    });
