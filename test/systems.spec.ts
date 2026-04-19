import { Module } from "@nanoforge-dev/ecs-server";
import { InputEnum } from "@nanoforge-dev/input";
import { accelerate2D } from "@systems/nf-accelerate-2d.system";
import { Acceleration2D } from "@systems/nf-acceleration-2d.component";
import { move2D } from "@systems/nf-move-2d.system";
import { moveControl2D } from "@systems/nf-move-control-2d.system";
import { MoveController2D } from "@systems/nf-move-controller-2d.component";
import { Position2D } from "@systems/nf-position-2d.component";
import { Velocity2D } from "@systems/nf-velocity-2d.component";
import { describe, expect, it } from "vitest";

describe("Systems", () => {
  describe("move2D", () => {
    it("should use velocity to update position", async () => {
      const m = await Module();
      const r = new m.Registry();

      const e = r.spawnEntity();

      r.addComponent(e, new Position2D(-2, 1));
      r.addComponent(e, new Velocity2D(50, -70));

      r.addSystem(move2D);

      r.runSystems({ app: { delta: 1000 } });
      expect(r.getComponents(Position2D).get(e.getId())).toStrictEqual(new Position2D(48, -69));

      r.runSystems({ app: { delta: 2500 } });
      expect(r.getComponents(Position2D).get(e.getId())).toStrictEqual(new Position2D(173, -244));
    });
    it("should use velocity to update position static", async () => {
      const m = await Module();
      const r = new m.Registry();

      const e = r.spawnEntity();

      r.addComponent(e, new Position2D(-2, 1));
      r.addComponent(e, new Velocity2D(0, 0));

      r.addSystem(move2D);

      r.runSystems({ app: { delta: 1000 } });
      expect(r.getComponents(Position2D).get(e.getId())).toStrictEqual(new Position2D(-2, 1));

      r.runSystems({ app: { delta: 2500 } });
      expect(r.getComponents(Position2D).get(e.getId())).toStrictEqual(new Position2D(-2, 1));
    });
  });
  describe("acceleration2D", () => {
    it("should use acceleration to update velocity", async () => {
      const m = await Module();
      const r = new m.Registry();

      const e = r.spawnEntity();

      r.addComponent(e, new Acceleration2D(5, -5));
      r.addComponent(e, new Velocity2D(-5, 10));

      r.addSystem(accelerate2D);

      r.runSystems({ app: { delta: 1000 } });
      expect(r.getComponents(Velocity2D).get(e.getId())).toStrictEqual(new Velocity2D(0, 5));

      r.runSystems({ app: { delta: 2500 } });
      expect(r.getComponents(Velocity2D).get(e.getId())).toStrictEqual(new Velocity2D(12.5, -7.5));
    });
    it("should use acceleration to update velocity to update position", async () => {
      const m = await Module();
      const r = new m.Registry();

      const e = r.spawnEntity();

      r.addComponent(e, new Acceleration2D(10, 10));
      r.addComponent(e, new Velocity2D(10, 10));
      r.addComponent(e, new Position2D(0, 0));

      r.addSystem(accelerate2D);
      r.addSystem(move2D);

      r.runSystems({ app: { delta: 1000 } });
      expect(r.getComponents(Position2D).get(e.getId())).toStrictEqual(new Position2D(20, 20));

      r.runSystems({ app: { delta: 2500 } });
      expect(r.getComponents(Position2D).get(e.getId())).toStrictEqual(
        new Position2D(132.5, 132.5),
      );
    });
  });
  describe("controller mouvement", () => {
    it("should go left", async () => {
      const m = await Module();
      const r = new m.Registry();

      const e = r.spawnEntity();

      r.addComponent(
        e,
        new MoveController2D(
          5,
          5,
          5,
          5,
          InputEnum.ArrowUp,
          InputEnum.ArrowDown,
          InputEnum.ArrowLeft,
          InputEnum.ArrowRight,
        ),
      );
      r.addComponent(e, new Velocity2D(0, 0));
      r.addComponent(e, new Position2D(0, 0));

      r.addSystem(moveControl2D);
      r.addSystem(move2D);

      r.runSystems({
        app: { delta: 1000 },
        libs: {
          getInput: () => {
            return {
              isKeyPressed: (key: InputEnum) => {
                return (
                  key === InputEnum.ArrowUp ||
                  key === InputEnum.ArrowDown ||
                  key === InputEnum.ArrowLeft
                );
              },
            };
          },
        },
      });
      expect(r.getComponents(Position2D).get(e.getId())).toStrictEqual(new Position2D(-5, 0));

      r.runSystems({
        app: { delta: 1000 },
        libs: {
          getInput: () => {
            return {
              isKeyPressed: (key: InputEnum) => {
                return (
                  key === InputEnum.ArrowUp ||
                  key === InputEnum.ArrowLeft ||
                  key === InputEnum.ArrowRight
                );
              },
            };
          },
        },
      });
      expect(r.getComponents(Position2D).get(e.getId())).toStrictEqual(new Position2D(-5, -5));

      r.runSystems({
        app: { delta: 1000 },
        libs: {
          getInput: () => {
            return {
              isKeyPressed: (key: InputEnum) => {
                return key === InputEnum.ArrowDown || key === InputEnum.ArrowRight;
              },
            };
          },
        },
      });
      expect(r.getComponents(Position2D).get(e.getId())).toStrictEqual(new Position2D(0, 0));
    });
  });
});
