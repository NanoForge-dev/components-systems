/**
 * The id of an entity on the network: the server and the clients know it by this id, and
 * `syncToClients2D` and `syncFromServer2D` keep its position the same on both. Give it the same id
 * in the server's and the clients' scenes. It needs a `Position2D`, and a `Velocity2D` for the
 * clients to move it between packets.
 *
 * @component
 * @side shared
 * @group Network color=#4aa3ff - How the server and the clients know the entity.
 */
export class NetworkId {
  name = "NetworkId";

  /** The velocity last sent to the clients, set by `syncToClients2D`: NaN to send it again. */
  sentX = Number.NaN;
  /** See `sentX`. */
  sentY = Number.NaN;
  /** On a client: whether the server's state for it arrived, set by `syncFromServer2D`. */
  synced = false;

  constructor(
    /** The same on the server and the clients, different per entity, 0 or more (negative ids are kept for the server's own, later). @group Network */
    public id = 0,
  ) {}
}
