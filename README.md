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
for [Engine v2](https://github.com/NanoForge-dev/engine). Each folder of [`packages`](packages) is one
package of the registry:

| Package                                          | Side   | What it gives                                                    |
| ------------------------------------------------ | ------ | ---------------------------------------------------------------- |
| [`@nanoforge/basics`](packages/basics)           | shared | `Position2D`, `Velocity2D`, `Acceleration2D` and `move2D`        |
| [`@nanoforge/graphics-2d`](packages/graphics-2d) | client | Rectangles, circles and texts with a color or an image, `draw2D` |
| [`@nanoforge/physics-2d`](packages/physics-2d)   | shared | Hitboxes, collisions, gravity, walls and platforms               |
| [`@nanoforge/controls-2d`](packages/controls-2d) | client | Move and jump with the keyboard                                  |
| [`@nanoforge/combat-2d`](packages/combat-2d)     | both   | Health, damage, bullets fired at the mouse                       |

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
- `@side client` for what uses graphics or input, `@side shared` for the rest;
- `@group`, `@preset`, `@color`, `@asset` lay out the inspector (see the editor's _Components_ doc).

Keep the parameters few and named for beginners, with what is less common in an `Advanced hidden`
group. Everything else stays reachable from code (`shape` on drawables, `collisions` on hitboxes).

A package imports another with its name and the path of a file in it:
`import { Position2D } from "@nanoforge/basics/components/position-2d"`.

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
