# @nanoforge/basics-3d

Where an entity is and how it moves in 3D: plain numbers, no Three.js, usable from server and
shared code.

- `Position3D`: units along the x, y and z axes.
- `Rotation3D`: degrees around the x, y and z axes.
- `Scale3D`: size multiplier on each axis, 1 by default.
- `Velocity3D`: units per second.
- `Acceleration3D`: units per second, per second.
- `move3D`: applies acceleration to velocity, then velocity to position.
