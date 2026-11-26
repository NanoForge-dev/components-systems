# @nanoforge/graphics-3d

Shows entities in the 3D scene of `@nanoforge-dev/graphics-3d`, without writing Three.js: add
`draw3D` after the systems that move them. Place them with `Position3D`, `Rotation3D` (degrees)
and `Scale3D` from `@nanoforge/basics-3d`. The project needs `@nanoforge-dev/graphics-3d` and its
peer `three`, and registers `Graphics3DLibrary` in the client's `main.ts`.

- `Box3D`, `Sphere3D`, `Plane3D`: lit shapes of one color. A `Plane3D` stands upright: lay it down
  as a ground with `Rotation3D(-90, 0, 0)`.
- `Light3D`: an `ambient`, `directional` (the sun) or `point` (a bulb) light. Until the scene has
  one, `draw3D` adds a default light, so shapes are never black.
- `Camera3D`: the point of view, looking along -z. The first active one is shown; with none, the
  library's camera at `(0, 0, 5)` looking at the origin.
- `Object3DComponent`: any Three.js object you built, such as an `InstancedMesh` for many identical
  objects. It moves with the transform components like the shapes.
- `draw3D`: gives each component its Three.js object and keeps it up to date. A removed component,
  or a killed entity, loses its object, and its geometries, materials and textures are disposed.

`toObject3D` (`object-3d.ts`) is the mapping from a component's params to its Three.js object.
`draw3D` uses it, and so can the editor, so both show the same thing.

## Order

`draw3D` last but one, after the systems that move entities (`move3D`), where `draw2D` goes in 2D.

## Recipes

- A cube, a ball, a light and a camera, in the client's `main.ts`:

  ```ts
  const cube = registry.spawnEntity();
  registry.addComponent(cube, new Box3D(1, 1, 1, "#44aa88"));
  registry.addComponent(cube, new Position3D(-1, 0, 0));
  registry.addComponent(cube, new Velocity3D(0, 0.5, 0));

  const ball = registry.spawnEntity();
  registry.addComponent(ball, new Sphere3D(0.5, "#ff6b6b"));
  registry.addComponent(ball, new Position3D(1, 0, 0));

  const sun = registry.spawnEntity();
  registry.addComponent(sun, new Light3D("directional", "#ffffff", 3));
  registry.addComponent(sun, new Position3D(3, 5, 4));

  const camera = registry.spawnEntity();
  registry.addComponent(camera, new Camera3D());
  registry.addComponent(camera, new Position3D(0, 1, 6));

  registry.addSystem(move3D);
  registry.addSystem(draw3D);
  ```
