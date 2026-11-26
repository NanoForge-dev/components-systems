<div align="center">
    <br />
    <p>
        <a href="https://github.com/NanoForge-dev"><img src="https://github.com/NanoForge-dev/components-systems/blob/main/.github/logo.png" width="546" alt="NanoForge" /></a>
    </p>
    <br />
    <p>
        <a href="https://www.npmjs.com/package/@nanoforge-dev/components-systems"><img src="https://img.shields.io/npm/v/@nanoforge-dev/components-systems.svg?maxAge=3600" alt="npm version" /></a>
        <a href="https://www.npmjs.com/package/@nanoforge-dev/components-systems"><img src="https://img.shields.io/npm/dt/@nanoforge-dev/components-systems.svg?maxAge=3600" alt="npm downloads" /></a>
		<a href="https://github.com/NanoForge-dev/components-systems/actions/workflows/tests.yml"><img src="https://github.com/NanoForge-dev/components-systems/actions/workflows/tests.yml/badge.svg" alt="Tests status" /></a>
        <a href="https://github.com/NanoForge-dev/components-systems/actions/workflows/push-docs.yml"><img src="https://github.com/NanoForge-dev/components-systems/actions/workflows/push-docs.yml/badge.svg" alt="Documentation status" /></a>
        <a href="https://github.com/NanoForge-dev/components-systems/commits/main/packages/components-systems"><img src="https://img.shields.io/github/last-commit/NanoForge-dev/components-systems.svg?logo=github&logoColor=ffffff&path=packages%2Fcore" alt="Last commit" /></a>
    	<a href="https://github.com/NanoForge-dev/components-systems/graphs/contributors"><img src="https://img.shields.io/github/contributors/NanoForge-dev/components-systems.svg?maxAge=3600&logo=github&logoColor=fff&color=00c7be" alt="Contributors" /></a>
    </p>
</div>

## About

`components-systems` holds NanoForge's official component and system packages for the editor, made
for [Engine v3](https://github.com/NanoForge-dev/engine). Each folder of [`packages`](packages) is one
package of the registry:

| Package                                          | Side   | What it gives                                                                                            |
| ------------------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------- |
| [`@nanoforge/basics-2d`](packages/basics-2d)     | shared | Position, velocity and `move2D`; tags, models, lifetimes, following another entity                       |
| [`@nanoforge/basics-3d`](packages/basics-3d)     | shared | `Position3D`, `Rotation3D`, `Scale3D`, `Velocity3D`, `Acceleration3D` and `move3D`                       |
| [`@nanoforge/graphics-2d`](packages/graphics-2d) | client | Shapes and texts with a color or an image, sprite animations, facing, a camera, a HUD, `draw2D`          |
| [`@nanoforge/graphics-3d`](packages/graphics-3d) | client | Boxes, spheres and planes of a color, lights, a camera, any Three.js object, `draw3D`                    |
| [`@nanoforge/physics-2d`](packages/physics-2d)   | shared | Hitboxes, collisions, gravity, walls, bounces and deflectors, walking, jumping, chasing and bounds       |
| [`@nanoforge/controls-2d`](packages/controls-2d) | client | Keyboard, mouse and gamepad controls for walking, jumping and shooting; click, drag and follow the mouse |
| [`@nanoforge/combat-2d`](packages/combat-2d)     | both   | Health, damage, shooters fired by a player, a turret or the server; health bars                          |
| [`@nanoforge/scenes-2d`](packages/scenes-2d)     | both   | Scene vars shown in texts, coins and zones that add to them                                              |
| [`@nanoforge/network-2d`](packages/network-2d)   | both   | The server sends where its entities are, how they move and which are gone; the clients follow            |
| [`@nanoforge/audio`](packages/audio)             | client | Sound effects, music per level, a mute key                                                               |

The packages to install in a new project are listed in [Default packages](docs/default-packages.md).

## Installation

In the editor: **File › Packages…**, search for `@nanoforge/`, and install. A package installs the
packages it depends on.

## Writing a component or a system

The editor reads everything from the code (TSDoc), there is no separate manifest per item:

- a component is a class tagged `@component`, with a literal `name` equal to the class name, and
  `public` constructor parameters with defaults: they are the fields of the inspector;
- a system is a function `(registry, ctx)` tagged `@system`, that queries its components with
  `registry.getZipper([A, B])`;
- `@side client` for what uses graphics or input or runs only on a client, `@side server` for what
  runs only on a server, `@side shared` for the rest;
- `@group`, `@preset`, `@color`, `@asset` lay out the inspector (see the editor's _Components_ doc).

Keep the parameters few and named for beginners, with what is less common in an `Advanced hidden`
group. Everything else stays reachable from code (`shape` on drawables, `collisions` on hitboxes).

A package imports another with its name and the path of a file in it:
`import { Position2D } from "@nanoforge/basics-2d/components/position-2d"`.

## Links

- [GitHub][source]
- [npm][npm]

## Contributing

Before creating an issue, please ensure that it hasn't already been reported/suggested, and double-check the
[documentation][documentation].  
See [the contribution guide][contributing] if you'd like to submit a PR.

## Help

If you don't understand something in the documentation, you are experiencing problems, or you just need a gentle nudge in the right direction, please don't hesitate to ask questions in [discussions][discussions].

[documentation]: https://github.com/NanoForge-dev/components-systems
[discussions]: https://github.com/NanoForge-dev/components-systems/discussions
[source]: https://github.com/NanoForge-dev/components-systems/tree/main/packages/components-systems
[npm]: https://www.npmjs.com/package/@nanoforge-dev/components-systems
[contributing]: https://github.com/NanoForge-dev/components-systems/blob/main/.github/CONTRIBUTING.md
