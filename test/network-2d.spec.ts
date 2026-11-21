import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { Velocity2D } from "@nanoforge/basics-2d/components/velocity-2d";
import { NetworkId } from "@nanoforge/network-2d/components/network-id";
import { Sync2DPacket, SyncRequestPacket } from "@nanoforge/network-2d/sync-packets";
import { syncFromServer2D } from "@nanoforge/network-2d/systems/sync-from-server-2d";
import { syncToClients2D } from "@nanoforge/network-2d/systems/sync-to-clients-2d";
import { describe, expect, it, vi } from "vitest";

import { alive, fake, fakeNetwork, frame, receive, registry, run, spawn, useEcs } from "./helpers";

useEcs();

describe("network-2d", () => {
  it("syncToClients2D sends an entity only when its velocity changed", () => {
    const velocity = new Velocity2D(10, 0);
    spawn(new Position2D(1, 2), velocity, new NetworkId(7));
    registry.addSystem(syncToClients2D);

    run();
    run();
    velocity.y = -5;
    run();

    expect(fake.network.sent).toEqual([
      { move: { id: 7, x: 1, y: 2, velocityX: 10, velocityY: 0 } },
      { move: { id: 7, x: 1, y: 2, velocityX: 10, velocityY: -5 } },
    ]);
  });

  it("syncToClients2D sends a removal once", () => {
    const entity = spawn(new Position2D(1, 2), new Velocity2D(), new NetworkId(7));
    spawn(new NetworkId(8));
    registry.addSystem(syncToClients2D);

    run();
    registry.killEntity(entity);
    run();
    run();

    expect(fake.network.sent).toEqual([
      { move: { id: 7, x: 1, y: 2, velocityX: 0, velocityY: 0 } },
      { remove: 7 },
    ]);
  });

  it("syncToClients2D sends no removal for an entity that only lost its Velocity2D", () => {
    const entity = spawn(new Position2D(), new Velocity2D(), new NetworkId(7));
    registry.addSystem(syncToClients2D);

    run();
    registry.removeComponent(entity, Velocity2D);
    run();

    expect(fake.network.sent).toEqual([
      { move: { id: 7, x: 0, y: 0, velocityX: 0, velocityY: 0 } },
    ]);
  });

  it("syncToClients2D sends an entity without a Velocity2D once, at rest, and again on respawn", () => {
    const still = () => spawn(new Position2D(10, 10), new NetworkId(5));
    const entity = still();
    registry.addSystem(syncToClients2D);

    run();
    registry.killEntity(entity);
    run();
    still();
    run();
    run();

    const move = { move: { id: 5, x: 10, y: 10, velocityX: 0, velocityY: 0 } };
    expect(fake.network.sent).toEqual([move, { remove: 5 }, move]);
  });

  it("syncToClients2D sends a stop when an entity loses its Velocity2D", () => {
    const entity = spawn(new Position2D(), new Velocity2D(10, 0), new NetworkId(7));
    registry.addSystem(syncToClients2D);

    run();
    registry.removeComponent(entity, Velocity2D);
    run();
    run();

    expect(fake.network.sent).toEqual([
      { move: { id: 7, x: 0, y: 0, velocityX: 10, velocityY: 0 } },
      { move: { id: 7, x: 0, y: 0, velocityX: 0, velocityY: 0 } },
    ]);
  });

  it("syncToClients2D sends each client that asks its moves and ids, once a frame", () => {
    spawn(new Position2D(10, 20), new Velocity2D(3, 4), new NetworkId(1));
    spawn(new Position2D(5, 6), new NetworkId(2));
    spawn(new NetworkId(3));
    registry.addSystem(syncToClients2D);
    receive(SyncRequestPacket, undefined, "c1");
    receive(SyncRequestPacket, undefined, "c2");
    receive(SyncRequestPacket, undefined, "c1");

    run();

    const catchUp = (clientId: string) => [
      {
        clientId,
        packet: Sync2DPacket.name,
        data: { move: { id: 1, x: 10, y: 20, velocityX: 3, velocityY: 4 } },
      },
      {
        clientId,
        packet: Sync2DPacket.name,
        data: { move: { id: 2, x: 5, y: 6, velocityX: 0, velocityY: 0 } },
      },
      { clientId, packet: Sync2DPacket.name, data: { present: [1, 2, 3] } },
    ];
    expect(fake.network.sentTo).toEqual([...catchUp("c1"), ...catchUp("c2")]);
  });

  it("syncToClients2D keeps its state per network: a fresh network object starts with none", () => {
    const entity = spawn(new Position2D(), new NetworkId(7));
    registry.addSystem(syncToClients2D);

    run();
    registry.killEntity(entity);
    fake.network = fakeNetwork();
    run();

    expect(fake.network.sent).toEqual([]);
  });

  it("syncFromServer2D gives the entities of those ids what the server sent", () => {
    const position = new Position2D();
    const velocity = new Velocity2D();
    const still = new Position2D();
    spawn(position, velocity, new NetworkId(3));
    spawn(still, new NetworkId(4));
    registry.addSystem(syncFromServer2D);
    receive(Sync2DPacket, { move: { id: 3, x: 40, y: 50, velocityX: 1, velocityY: 2 } });
    receive(Sync2DPacket, { move: { id: 4, x: 7, y: 8, velocityX: 1, velocityY: 2 } });
    receive(Sync2DPacket, { move: { id: 99, x: 0, y: 0, velocityX: 0, velocityY: 0 } });

    run();

    expect(position).toMatchObject({ x: 40, y: 50 });
    expect(velocity).toMatchObject({ x: 1, y: 2 });
    expect(still).toMatchObject({ x: 7, y: 8 });
  });

  it("syncFromServer2D parks a removed entity, and a later move brings it back", () => {
    const entity = spawn(new Position2D(), new Velocity2D(), new NetworkId(3));
    registry.addSystem(syncFromServer2D);
    // A move and a removal in the same tick: the removal wins, so no ghost stays.
    receive(Sync2DPacket, { move: { id: 3, x: 10, y: 10, velocityX: 5, velocityY: 0 } });
    receive(Sync2DPacket, { remove: 3 });
    receive(Sync2DPacket, { remove: 99 });

    run();
    const parked = !alive(Position2D, entity);
    fake.network.received.length = 0;
    receive(Sync2DPacket, { move: { id: 3, x: 40, y: 50, velocityX: 1, velocityY: 2 } });
    run();

    expect(parked).toBe(true);
    expect(registry.getEntityComponent(entity, Position2D)).toMatchObject({ x: 40, y: 50 });
    expect(registry.getEntityComponent(entity, Velocity2D)).toMatchObject({ x: 1, y: 2 });
  });

  it("syncFromServer2D applies packets in arrival order: a removal then a move shows it", () => {
    const entity = spawn(new Position2D(), new Velocity2D(), new NetworkId(3));
    registry.addSystem(syncFromServer2D);
    receive(Sync2DPacket, { present: [3] });
    run();
    fake.network.received.length = 0;
    receive(Sync2DPacket, { remove: 3 });
    receive(Sync2DPacket, { move: { id: 3, x: 100, y: 100, velocityX: 0, velocityY: 0 } });

    run();
    fake.network.received.length = 0;
    run();

    expect(registry.getEntityComponent(entity, Position2D)).toMatchObject({ x: 100, y: 100 });
  });

  it("syncFromServer2D shows an id moved after a Present that didn't list it, in one tick", () => {
    spawn(new Position2D(), new NetworkId(1));
    const lateId = new NetworkId(9);
    const late = spawn(new Position2D(), lateId);
    registry.addSystem(syncFromServer2D);
    receive(Sync2DPacket, { present: [1] });
    receive(Sync2DPacket, { move: { id: 9, x: 5, y: 6, velocityX: 0, velocityY: 0 } });

    run();

    expect(registry.getEntityComponent(late, Position2D)).toMatchObject({ x: 5, y: 6 });
    expect(lateId.synced).toBe(true);
  });

  it("syncFromServer2D marks every entity synced on a Present, and parks the unlisted ones", () => {
    const listedId = new NetworkId(1);
    const unlistedId = new NetworkId(2);
    const listed = spawn(new Position2D(), listedId);
    const unlisted = spawn(new Position2D(), unlistedId);
    registry.addSystem(syncFromServer2D);
    receive(Sync2DPacket, { present: [1, 5] });

    run();

    expect(alive(Position2D, listed)).toBe(true);
    expect(alive(Position2D, unlisted)).toBe(false);
    expect([listedId.synced, unlistedId.synced]).toEqual([true, true]);
  });

  it("syncFromServer2D asks to catch up once a second, per network, until synced", () => {
    spawn(new Position2D(), new NetworkId(1));
    registry.addSystem(syncFromServer2D);
    const requests: number[] = [];
    for (let i = 0; i < 4; i++) {
      run(frame(400));
      requests.push(fake.network.sentToServer.length);
    }
    const first = fake.network.sentToServer[0];

    fake.network = fakeNetwork();
    run(frame(16));
    requests.push(fake.network.sentToServer.length);
    receive(Sync2DPacket, { present: [1] });
    run(frame(2000));
    fake.network.received.length = 0;
    run(frame(2000));
    requests.push(fake.network.sentToServer.length);

    expect(first).toEqual({ packet: SyncRequestPacket.name, data: undefined });
    expect(requests).toEqual([1, 1, 1, 2, 1, 1]);
  });

  it("syncFromServer2D warns once when two entities share a NetworkId, and moves the first", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const first = new Position2D();
    const second = new Position2D();
    const secondId = new NetworkId(1);
    spawn(first, new NetworkId(1));
    spawn(second, secondId);
    registry.addSystem(syncFromServer2D);
    receive(Sync2DPacket, { move: { id: 1, x: 40, y: 50, velocityX: 0, velocityY: 0 } });
    receive(Sync2DPacket, { present: [1] });

    run();
    run();

    expect(warn).toHaveBeenCalledOnce();
    expect(first).toMatchObject({ x: 40, y: 50 });
    expect(second).toMatchObject({ x: 0, y: 0 });
    // Synced too, or the client would ask to catch up every second.
    expect(secondId.synced).toBe(true);
    warn.mockRestore();
  });

  it("checks a received sync item before it is read", () => {
    const move = { id: 1, x: 0, y: 0, velocityX: 0, velocityY: 0 };
    const valid = (data: unknown) => Sync2DPacket.validate?.(data);

    expect([valid({ move }), valid({ remove: 3 }), valid({ present: [1, 2] })]).toEqual([
      true,
      true,
      true,
    ]);
    expect(valid({ present: [] })).toBe(true);
    expect(valid({ move: { ...move, x: "0" } })).toBe(false);
    expect(valid({ move: { ...move, velocityY: Number.NaN } })).toBe(false);
    expect(valid({ remove: "3" })).toBe(false);
    expect(valid({ remove: Number.POSITIVE_INFINITY })).toBe(false);
    expect(valid({ present: [1, Number.NaN] })).toBe(false);
    expect(valid({ present: "1,2" })).toBe(false);
    expect(valid({})).toBe(false);
    expect(valid({ move, remove: 3 })).toBe(false);
    expect(valid(null)).toBe(false);
    expect(valid(undefined)).toBe(false);
  });
});
