import type { Context, InitContext } from "@nanoforge-dev/common";
import { EcsLibrary, type Registry } from "@nanoforge-dev/ecs/server";
import type { Layer, Shape } from "@nanoforge-dev/graphics-2d";
import { Position2D } from "@nanoforge/basics-2d/components/position-2d";
import { DrawableCircle2D } from "@nanoforge/graphics-2d/components/drawable-circle-2d";
import { DrawableRect2D } from "@nanoforge/graphics-2d/components/drawable-rect-2d";
import { DrawableText2D } from "@nanoforge/graphics-2d/components/drawable-text-2d";
import { imageFill } from "@nanoforge/graphics-2d/image-fill";
import { draw2D } from "@nanoforge/graphics-2d/systems/draw-2d";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

/** Images as `document.createElement("img")` makes them: 100 by 50 once given a `src`. */
const images: { src: string; naturalWidth: number; naturalHeight: number }[] = [];

/** A 2D context where everything does nothing and measures 0: Konva needs one. */
const noop: object = new Proxy(() => noop, {
  get: (_, key) => (key === Symbol.toPrimitive ? () => 0 : key === "canvas" ? {} : noop),
});

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

/** A layer that only records what is added: tests run without a canvas. */
const fakeLayer = () => {
  const shapes: Shape[] = [];
  return { shapes, add: (shape: Shape) => shapes.push(shape) } as unknown as Layer & {
    shapes: Shape[];
  };
};

const assets = {
  getAsset: (path: string) => {
    if (path === "/missing.png") throw new Error("not found");
    return { path: `blob:${path}` };
  },
} as unknown as Context["assets"];

beforeEach(() => {
  vi.stubGlobal("document", { createElement });
});

afterEach(() => {
  vi.unstubAllGlobals();
  images.length = 0;
});

describe("imageFill", () => {
  it("fills with the color without an image", () => {
    expect(imageFill(assets, "", 10, 10)).toMatchObject({ fillPriority: "color" });
  });

  it("stretches the image found in the assets over the shape, once per path", () => {
    const fill = imageFill(assets, "/hero.png", 200, 200);
    imageFill(assets, "/hero.png", 200, 200);

    expect(images).toHaveLength(1);
    expect(images[0]!.src).toBe("blob:/hero.png");
    expect(fill).toMatchObject({
      fillPriority: "pattern",
      fillPatternScaleX: 2,
      fillPatternScaleY: 4,
      fillPatternOffsetX: 0,
    });
    expect(imageFill(assets, "/hero.png", 100, 50, true)).toMatchObject({
      fillPatternOffsetX: 50,
      fillPatternOffsetY: 25,
    });
  });

  it("keeps the color when there is no asset at the path, or until it is loaded", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(imageFill(assets, "/missing.png", 10, 10)).toMatchObject({ fillPriority: "color" });
    expect(warn).toHaveBeenCalledOnce();

    vi.stubGlobal("document", {
      createElement: () => ({ src: "", naturalWidth: 0, naturalHeight: 0 }),
    });
    expect(imageFill(assets, "/loading.png", 10, 10)).toMatchObject({ fillPriority: "color" });
  });
});

describe("drawables", () => {
  it("make their shape on the first draw and keep it up to date", () => {
    const layer = fakeLayer();
    const rect = new DrawableRect2D(30, 40, "red");

    rect.draw(layer, new Position2D(1, 2), assets);
    const shape = rect.shape;
    rect.width = 60;
    rect.draw(layer, new Position2D(5, 6), assets);

    expect(rect.shape).toBe(shape);
    expect(rect.shape?.getAttrs()).toMatchObject({
      x: 5,
      y: 6,
      width: 60,
      height: 40,
      fill: "red",
    });
  });

  it("draw circles at their center and texts with their text", () => {
    const layer = fakeLayer();
    const circle = new DrawableCircle2D(10, "blue");
    const text = new DrawableText2D("Score: 3", 12);

    circle.draw(layer, new Position2D(50, 50), assets);
    text.draw(layer, new Position2D(0, 0));

    expect(circle.shape?.getAttrs()).toMatchObject({ x: 50, y: 50, radius: 10, fill: "blue" });
    expect(text.shape?.getAttrs()).toMatchObject({ text: "Score: 3", fontSize: 12 });
  });

  it("lose their shape when destroyed", () => {
    const text = new DrawableText2D();
    text.draw(fakeLayer(), new Position2D());

    text.destroy();

    expect(text.shape).toBeUndefined();
  });
});

describe("draw2D", () => {
  let registry: Registry;

  beforeAll(async () => {
    const ecs = new EcsLibrary();
    await ecs.__init({
      files: new Map([
        ["/libecs.wasm", "./node_modules/@nanoforge-dev/ecs/dist/server/libecs.wasm"],
      ]),
    } as unknown as InitContext);
    registry = ecs.registry;
  });

  it("draws every drawable on the base layer, and removes those no longer in the world", () => {
    const layer = fakeLayer();
    const ctx = { graphics: { baseLayer: layer }, assets } as unknown as Context;
    const rect = new DrawableRect2D();
    const circle = new DrawableCircle2D();
    const text = new DrawableText2D();
    const killed = registry.spawnEntity();
    registry.addComponent(killed, new Position2D(3, 4));
    registry.addComponent(killed, rect);
    const kept = registry.spawnEntity();
    registry.addComponent(kept, new Position2D());
    registry.addComponent(kept, circle);
    registry.addComponent(kept, text);
    registry.addSystem(draw2D);

    registry.runSystems(ctx);
    expect(layer.shapes).toHaveLength(3);
    expect(rect.shape?.getAttrs()).toMatchObject({ x: 3, y: 4 });

    registry.killEntity(killed);
    registry.runSystems(ctx);
    expect(rect.shape).toBeUndefined();
    expect(circle.shape).toBeDefined();
    expect(text.shape).toBeDefined();
  });
});
