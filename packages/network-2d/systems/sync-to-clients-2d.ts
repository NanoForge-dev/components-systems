import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import type { PacketDefinition } from "@nanoforge-dev/network";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { Velocity2D } from "@nanoforge/basics-2d/components/velocity-2d";

import { NetworkId } from "../components/network-id";
import { type Move2D, Sync2DPacket, SyncRequestPacket } from "../sync-packets";

/**
 * The server's `ctx.network`, as far as this system uses it. The client and server libraries
 * both declare `ctx.network`, with different types: a package holding both sides can't import
 * them together.
 */
interface ServerNetwork {
  packets: {
    read<T>(packet: PacketDefinition<T>): { clientId: string; data: T }[];
    sendToAll<T>(packet: PacketDefinition<T>, data: T): void;
    sendToClient<T>(clientId: string, packet: PacketDefinition<T>, data: T): void;
  };
}

/** The `NetworkId`s of last frame, per `ctx.network`, which the engine makes once per app. */
const lastIds = new WeakMap<object, Set<number>>();

/** The `Move2D` of an entity, at rest without a `Velocity2D`. */
const moveOf = (id: number, position: Position2D, velocity?: Velocity2D): Move2D => ({
  id,
  x: position.x,
  y: position.y,
  velocityX: velocity?.x ?? 0,
  velocityY: velocity?.y ?? 0,
});

/**
 * Sends every client what the `NetworkId` entities do: the position and velocity of each one with a
 * `Position2D`, when it appears and whenever its velocity changes (no `Velocity2D` counts as at
 * rest), which the clients' `move2D` then follows until the next change, and the id of each one
 * that is gone. Answers a client that asks to catch up (`syncFromServer2D`) with where
 * every entity is and which ids exist. Add it last, on the server.
 *
 * @remarks
 * An id is gone once no entity has that `NetworkId`: an entity that only lost its `Velocity2D` or
 * `Position2D` stays. A catch-up is a move per entity that has a `Position2D`, then the ids of all
 * of them. A position set without a velocity change isn't sent: set `NetworkId.sentX` to NaN to
 * send it.
 *
 * @system
 * @side server
 * @uses network
 */
export const syncToClients2D = (registry: Registry, ctx: Context) => {
  const network = (ctx as unknown as { network: ServerNetwork }).network;
  const { packets } = network;

  (
    registry.getIndexedZipper([NetworkId, Position2D]) as {
      id: number;
      NetworkId: NetworkId;
      Position2D: Position2D;
    }[]
  ).forEach(({ id, NetworkId: sync, Position2D: position }) => {
    const entity = registry.entityFromIndex(id);
    const move = moveOf(sync.id, position, registry.getEntityComponent(entity, Velocity2D));
    if (move.velocityX === sync.sentX && move.velocityY === sync.sentY) return;
    packets.sendToAll(Sync2DPacket, { move });
    sync.sentX = move.velocityX;
    sync.sentY = move.velocityY;
  });

  const present = registry.getIndexedZipper([NetworkId]) as { id: number; NetworkId: NetworkId }[];
  const ids = new Set(present.map(({ NetworkId }) => NetworkId.id));
  for (const id of lastIds.get(network) ?? [])
    if (!ids.has(id)) packets.sendToAll(Sync2DPacket, { remove: id });
  lastIds.set(network, ids);

  const clients = new Set(packets.read(SyncRequestPacket).map(({ clientId }) => clientId));
  if (clients.size === 0) return;
  const moves = present.flatMap(({ id, NetworkId }) => {
    const entity = registry.entityFromIndex(id);
    const position: Position2D | undefined = registry.getEntityComponent(entity, Position2D);
    return position
      ? [moveOf(NetworkId.id, position, registry.getEntityComponent(entity, Velocity2D))]
      : [];
  });
  for (const clientId of clients) {
    for (const move of moves) packets.sendToClient(clientId, Sync2DPacket, { move });
    packets.sendToClient(clientId, Sync2DPacket, { present: [...ids] });
  }
};
