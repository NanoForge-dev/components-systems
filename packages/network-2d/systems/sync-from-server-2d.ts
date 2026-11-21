import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import type { PacketDefinition } from "@nanoforge-dev/network";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { Velocity2D } from "@nanoforge/basics-2d/components/velocity-2d";

import { NetworkId } from "../components/network-id";
import { Sync2DPacket, SyncRequestPacket } from "../sync-packets";

/**
 * The client's `ctx.network`, as far as this system uses it (see `syncToClients2D` for why it is
 * not imported).
 */
interface ClientNetwork {
  packets: {
    read<T>(packet: PacketDefinition<T>): { data: T }[];
    send(packet: PacketDefinition<void>): void;
  };
}

/** Seconds before the next `SyncRequestPacket` may go, per `ctx.network`. */
const untilRequest = new WeakMap<object, number>();

/** Whether two entities sharing a `NetworkId` were reported. */
let warned = false;

/**
 * Gives the `NetworkId` entities what the server sent (`syncToClients2D`): their positions and
 * velocities, and parks the ones the server no longer has. Add it before `move2D`, on the
 * clients.
 *
 * @remarks
 * A parked entity loses its `Position2D`, so it isn't drawn, doesn't collide, isn't clicked and
 * leaves the camera; a later move from the server gives it one again. Until the server's state of
 * every `NetworkId` entity arrived (`synced`), it asks the server for it, once a second, which
 * also parks the entities the server doesn't have. Two entities with the same `NetworkId` are
 * reported once: only the first one follows the server.
 *
 * @system
 * @side client
 * @uses app network
 */
export const syncFromServer2D = (registry: Registry, ctx: Context) => {
  const network = (ctx as unknown as { network: ClientNetwork }).network;
  const { packets } = network;
  const all = registry.getIndexedZipper([NetworkId]) as { id: number; NetworkId: NetworkId }[];
  const entities = new Map<number, number>();
  for (const { id, NetworkId } of all) {
    if (!entities.has(NetworkId.id)) entities.set(NetworkId.id, id);
    else if (!warned) {
      warned = true;
      console.warn(`Two entities have the NetworkId ${NetworkId.id}: only the first one follows.`);
    }
  }
  const park = (id: number) => registry.removeComponent(registry.entityFromIndex(id), Position2D);

  // One packet type, read in the order the server sent it: a removal then a respawn's move, in one
  // tick, leaves the entity shown; a move then a removal leaves it parked.
  for (const { data } of packets.read(Sync2DPacket)) {
    if ("move" in data) {
      const move = data.move;
      const id = entities.get(move.id);
      if (id === undefined) continue;
      const entity = registry.entityFromIndex(id);
      const position: Position2D | undefined = registry.getEntityComponent(entity, Position2D);
      if (position) Object.assign(position, { x: move.x, y: move.y });
      else registry.addComponent(entity, new Position2D(move.x, move.y));
      const velocity: Velocity2D | undefined = registry.getEntityComponent(entity, Velocity2D);
      if (velocity) Object.assign(velocity, { x: move.velocityX, y: move.velocityY });
    } else if ("remove" in data) {
      const id = entities.get(data.remove);
      if (id !== undefined) park(id);
    } else {
      for (const { id, NetworkId } of all) {
        NetworkId.synced = true;
        if (!data.present.includes(NetworkId.id)) park(id);
      }
    }
  }

  const left = (untilRequest.get(network) ?? 0) - ctx.app.delta / 1000;
  const request = left <= 0 && all.some(({ NetworkId }) => !NetworkId.synced);
  if (request) packets.send(SyncRequestPacket);
  untilRequest.set(network, request ? 1 : left);
};
