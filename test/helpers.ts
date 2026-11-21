import type { Context, InitContext } from "@nanoforge-dev/common";
import { EcsLibrary, type Registry } from "@nanoforge-dev/ecs/server";
import type { Layer, Shape } from "@nanoforge-dev/graphics-2d";
import type { DragState, InputEnum, MouseState } from "@nanoforge-dev/input";
import type { ControllerButton, StickPosition } from "@nanoforge-dev/input/controller";
import type { PacketDefinition } from "@nanoforge-dev/network";
import { type Mock, afterEach, beforeAll, beforeEach, vi } from "vitest";

/*
 * What every spec file shares. At the top of a spec file, call `useEcs()`, and `stubDocument()`
 * when its tests make Konva shapes. A test spawns entities (`spawn`), adds systems
 * (`registry.addSystem`), sets what the player does in `fake`, and runs frames (`run(frame(ms))`).
 */

/** The server ECS registry, booted by `useEcs` before the first test of the file. */
export let registry: Registry;

/** A Konva layer as the systems use it: see `fakeLayer`. */
export type FakeLayer = Layer & { at: { x: number; y: number; zoom: number }; shapes: Shape[] };

/** A layer moved and zoomed by `followCamera2D` (`at`), and recording what `draw` adds (`shapes`). */
export const fakeLayer = (): FakeLayer => {
  const at = { x: 0, y: 0, zoom: 1 };
  const shapes: Shape[] = [];
  return {
    at,
    shapes,
    x: () => at.x,
    y: () => at.y,
    scaleX: () => at.zoom,
    scaleY: () => at.zoom,
    position: ({ x, y }: { x: number; y: number }) => Object.assign(at, { x, y }),
    scale: ({ x }: { x: number; y: number }) => (at.zoom = x),
    // It never becomes the shape's parent: `getParent()` stays null and `zIndex()` 0.
    add: (shape: Shape) => shapes.push(shape),
  } as unknown as FakeLayer;
};

/** An 800 by 600 screen without the editor's viewport; `layers` gets what is added (the HUD's). */
export interface FakeStage {
  layers: Layer[];
  x(): number;
  y(): number;
  width(): number;
  height(): number;
  scaleX(): number;
  scaleY(): number;
  add(layer: Layer): void;
}

/** A new `FakeStage`: `hudLayer` makes one layer per stage. */
export const fakeStage = (): FakeStage => {
  const layers: Layer[] = [];
  return {
    layers,
    x: () => 0,
    y: () => 0,
    width: () => 800,
    height: () => 600,
    scaleX: () => 1,
    scaleY: () => 1,
    add: (layer) => layers.push(layer),
  };
};

/** A packet `packets.read` returns: `clientId` is its sender, on the server. */
export interface Received {
  packet: string;
  clientId?: string;
  data?: unknown;
}

/**
 * A test's `ctx.network`, the client's and the server's at once. Every frame gets the same object,
 * so state kept per `ctx.network` lasts the test; `fake.network = fakeNetwork()` is a fresh one.
 */
export const fakeNetwork = () => {
  const network = {
    /** The data of each `packets.sendToAll(packet, data)` (server). */
    sent: [] as unknown[],
    /** Each `packets.sendToClient(clientId, packet, data)` (server), with the packet's name. */
    sentTo: [] as { clientId: string; packet: string; data: unknown }[],
    /** Each `packets.send(packet, data)` (client), with the packet's name. */
    sentToServer: [] as { packet: string; data: unknown }[],
    /** What `packets.read(packet)` returns, as `{ clientId, data }`, by the packet's name. */
    received: [] as Received[],
    packets: {
      sendToAll: (_packet: PacketDefinition<unknown>, data?: unknown) => network.sent.push(data),
      sendToClient: (clientId: string, packet: PacketDefinition<unknown>, data?: unknown) =>
        network.sentTo.push({ clientId, packet: packet.name, data }),
      send: (packet: PacketDefinition<unknown>, data?: unknown) =>
        network.sentToServer.push({ packet: packet.name, data }),
      read: (packet: PacketDefinition<unknown>) =>
        network.received
          .filter((entry) => entry.packet === packet.name)
          .map(({ clientId, data }) => ({ clientId, data })),
    },
  };
  return network;
};

/** The network of `fakeNetwork`. */
export type FakeNetwork = ReturnType<typeof fakeNetwork>;

/** `ctx.sound` or `ctx.music`: spies. */
export interface FakeAudio {
  load: Mock;
  play: Mock;
  mute: Mock;
}

/** Everything `frame()` reads and records, made again before each test. */
export interface Fakes {
  /** Keys and mouse buttons held: `ctx.input.isKeyPressed`. */
  keys: Set<InputEnum>;
  /** The cursor, in game coordinates. `deltaX`/`deltaY` (0) and `focus` (true) last until changed. */
  mouse: { x: number; y: number; deltaX?: number; deltaY?: number; focus?: boolean };
  /** `ctx.input.getDragState()`. */
  drag: Partial<DragState>;
  /** `ctx.controller.getStick(stick)`, for any gamepad. */
  sticks: Record<"left" | "right", StickPosition>;
  /** Gamepad buttons held: `ctx.controller.isButtonPressed(button)`, for any gamepad. */
  buttons: Set<ControllerButton>;
  /** Scene vars: `ctx.scenes.vars.get` and `set`. */
  vars: Map<string, unknown>;
  /** `ctx.graphics.stage`. */
  stage: FakeStage;
  /** `ctx.graphics.baseLayer`. */
  baseLayer: FakeLayer;
  /** `ctx.sound`. */
  sound: FakeAudio;
  /** `ctx.music`. */
  music: FakeAudio;
  /** `ctx.network`. */
  network: FakeNetwork;
}

const fakeAudio = (): FakeAudio => ({ load: vi.fn(), play: vi.fn(), mute: vi.fn() });

const freshFakes = (): Fakes => ({
  keys: new Set(),
  mouse: { x: 0, y: 0 },
  drag: { active: false },
  sticks: { left: { x: 0, y: 0 }, right: { x: 0, y: 0 } },
  buttons: new Set(),
  vars: new Map(),
  stage: fakeStage(),
  baseLayer: fakeLayer(),
  sound: fakeAudio(),
  music: fakeAudio(),
  network: fakeNetwork(),
});

/** This test's player and libraries: set what is held or received, then `run(frame())`. */
export const fake: Fakes = freshFakes();

/** Adds a packet to `fake.network.received`: `packets.read(packet)` returns it every frame. */
export const receive = <T>(packet: PacketDefinition<T>, data?: T, clientId?: string) =>
  fake.network.received.push({ packet: packet.name, clientId, data });

/** `ctx.assets`: a blob URL per path, and no asset at a path starting with `/missing`. */
export const assets = {
  getAsset: (path: string) => {
    if (path.startsWith("/missing")) throw new Error("not found");
    return { path: `blob:${path}` };
  },
} as unknown as Context["assets"];

/**
 * The ctx of a frame of `ms` milliseconds, built from `fake`. `without` leaves ctx fields out:
 * `frame(16, ["controller"])` is an app without ControllerLibrary, `["graphics"]` one without
 * Graphics2DLibrary.
 */
export const frame = (ms = 1000, without: string[] = []): Context => {
  const ctx: Record<string, unknown> = {
    app: { delta: ms },
    input: {
      isKeyPressed: (key: InputEnum) => fake.keys.has(key),
      getMousePosition: () => ({ x: fake.mouse.x, y: fake.mouse.y }),
      getMouseState: (): MouseState => {
        const { x, y, deltaX = 0, deltaY = 0, focus = true } = fake.mouse;
        return { x, y, prevX: x - deltaX, prevY: y - deltaY, deltaX, deltaY, focus };
      },
      getDragState: () => fake.drag,
    },
    controller: {
      getStick: (stick: "left" | "right") => fake.sticks[stick],
      isButtonPressed: (button: ControllerButton) => fake.buttons.has(button),
      isConnected: () => true,
    },
    graphics: { stage: fake.stage, baseLayer: fake.baseLayer },
    scenes: {
      vars: {
        get: (key: string) => fake.vars.get(key),
        set: (key: string, value: unknown) => fake.vars.set(key, value),
      },
    },
    sound: fake.sound,
    music: fake.music,
    network: fake.network,
    assets,
  };
  for (const key of without) delete ctx[key];
  return ctx as unknown as Context;
};

/** Spawns an entity with `components`. */
export const spawn = (...components: { name: string }[]) => {
  const entity = registry.spawnEntity();
  for (const component of components) registry.addComponent(entity, component);
  return entity;
};

/** Runs every system once, on `ctx` (a frame of 1 second by default). */
export const run = (ctx = frame()) => registry.runSystems(ctx);

/** Whether the entity still exists, by one of its components. */
export const alive = (
  component: Parameters<Registry["getComponents"]>[0],
  entity: { getId(): number },
) => registry.getComponents(component).get(entity.getId()) !== undefined;

/**
 * Boots the server ECS (its wasm from `node_modules`) before the first test of the file, and
 * before each test clears its systems and entities and makes `fake` again. Call it once, at the
 * top of the file.
 */
export const useEcs = () => {
  beforeAll(async () => {
    const ecs = new EcsLibrary();
    await ecs.__init({
      files: new Map([
        ["/libecs.wasm", "./node_modules/@nanoforge-dev/ecs/dist/server/libecs.wasm"],
      ]),
    } as unknown as InitContext);
    registry = ecs.registry;
  });

  beforeEach(() => {
    registry.clearSystems();
    registry.clearEntities();
    Object.assign(fake, freshFakes());
  });
};

/** A 2D context where everything does nothing and measures 0: Konva needs one. */
const noop: object = new Proxy(() => noop, {
  get: (_, key) => (key === Symbol.toPrimitive ? () => 0 : key === "canvas" ? {} : noop),
});

/**
 * Stubs `document` during each test of the file (or of the `describe` it is called in), so Konva
 * shapes and layers work without a canvas. Returns the images `document.createElement("img")`
 * made, emptied after each test: 100 by 50 once given a `src`.
 */
export const stubDocument = () => {
  const images: { src: string; naturalWidth: number; naturalHeight: number }[] = [];
  const createElement = (tag: string) => {
    if (tag === "canvas") return { style: {}, getContext: () => noop };
    const image = {
      src: "",
      get naturalWidth() {
        return this.src ? 100 : 0;
      },
      get naturalHeight() {
        return this.src ? 50 : 0;
      },
    };
    images.push(image);
    return image;
  };

  beforeEach(() => {
    vi.stubGlobal("document", { createElement });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    images.length = 0;
  });

  return images;
};
