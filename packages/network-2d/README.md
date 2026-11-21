# @nanoforge/network-2d

Multiplayer in 2D, with the engine's `network` library: the server sends where its entities are,
how they move and which are gone; the clients follow, and catch up when they join.

- `NetworkId`: the same id on the server's and the clients' entity, different for each entity, 0
  or more.
- `syncToClients2D`, on the server, last: sends the position and velocity of each `NetworkId`
  entity with a `Position2D` when it appears and whenever its velocity changes (no `Velocity2D`
  counts as at rest), and the id of each one that is gone. A client that asks to catch
  up gets where every entity is and which ids exist.
- `syncFromServer2D`, on the clients, before `move2D`: applies them. An entity the server removed,
  or doesn't have, is parked: it loses its `Position2D`, so it isn't drawn, doesn't collide, isn't
  clicked and leaves the camera, until a move from the server brings it back. Until the server's
  state arrived (`NetworkId.synced`), it asks to catch up, once a second: a client that joins late
  or reloads its scene gets the game as it is.

All of it goes in one packet type, `Sync2DPacket`, so the clients apply it in the order the server
sent it. Received packets are checked before use (`sync-packets.ts`).

## A multiplayer player (movement only)

- On the server: `Position2D`, `Velocity2D`, `HitboxRect2D`, `WalkAndJump2D` and `NetworkId(1)`.
- On the clients: `Position2D`, `Velocity2D`, `DrawableRect2D`, the server's `HitboxRect2D`,
  `NetworkId(1)`, `KeyboardControls2D` and `Tag("me")`, with a camera entity: a `Camera2D` whose
  `target` is `me`.

The game runs on the server, and the game's own code links both sides:

- on the client, a sender sends what `KeyboardControls2D` read (`moveX`, `moveY`, `jump`) when it
  changes;
- on the server, a packet handler writes it into the `WalkAndJump2D` of that player's entity. It
  latches a press into `jumpRequested` (`fireRequested` for a `Shoot2D`), so a press shorter than
  a server frame isn't lost, and resets that player's intents on
  `ctx.network.clients.onDisconnect`, so a player who leaves stops.

Systems, in order:

- server: the packet handler, `walkAndJump2D`, `move2D`, `detectCollisions2D`,
  `blockOnStaticBodies2D`, `syncToClients2D`;
- client: `readKeyboard2D`, the sender, `syncFromServer2D`, `move2D`, `followCamera2D`, `draw2D`.

A network client runs neither the systems that act on intents (`walkAndJump2D`, `shoot2D`...) nor
the shared ones that remove entities (`expireLifetimes`, `keepInBounds2D` in destroy mode,
`collect2D`, `applyDamage2D`, `destroyOnHit2D`): the server removes entities, and the clients park
them.

Not yet: entities spawned on the server, such as bullets, don't appear on the clients, and
`Health`, scene vars and the aim aren't sent.
