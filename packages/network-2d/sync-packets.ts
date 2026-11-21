import { definePacket } from "@nanoforge-dev/network";

/** Where an entity is and how it moves, sent by `syncToClients2D` to the clients. */
export interface Move2D {
  /** The entity's `NetworkId`. */
  id: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
}

/**
 * One item of what the server sends the clients: a `Move2D`, the `NetworkId` of an entity gone
 * from the server, or the `NetworkId` of every entity on the server (after a catch-up).
 */
export type Sync2D = { move: Move2D } | { remove: number } | { present: number[] };

const FIELDS = ["id", "x", "y", "velocityX", "velocityY"] as const;

/** Whether `data`, received from the network, is an object: a packet is checked before use. */
const isObject = (data: unknown): data is Record<string, unknown> =>
  typeof data === "object" && data !== null;

const isMove2D = (data: unknown): data is Move2D =>
  isObject(data) && FIELDS.every((field) => Number.isFinite(data[field]));

/** Whether `data` is a `Sync2D`: exactly one of `move`, `remove` or `present`, well formed. */
const isSync2D = (data: unknown): data is Sync2D => {
  if (!isObject(data) || Object.keys(data).length !== 1) return false;
  if ("move" in data) return isMove2D(data.move);
  if ("remove" in data) return Number.isFinite(data.remove);
  return Array.isArray(data.present) && data.present.every((id: unknown) => Number.isFinite(id));
};

/**
 * Everything `syncToClients2D` sends the clients, in one packet type so that `syncFromServer2D`
 * applies it in the order it was sent.
 */
export const Sync2DPacket = definePacket<Sync2D>("@nanoforge/network-2d:sync", {
  validate: isSync2D,
});

/** Asks the server where every entity is, sent by `syncFromServer2D` until it knows. */
export const SyncRequestPacket = definePacket("@nanoforge/network-2d:sync-request");
