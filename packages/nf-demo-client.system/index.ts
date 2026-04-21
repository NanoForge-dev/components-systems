import { type Context } from "@nanoforge-dev/common";
import { type EditorSystemManifest, type Registry } from "@nanoforge-dev/ecs-lib";
import { InputEnum, type InputLibrary } from "@nanoforge-dev/input";
import { type NetworkClientLibrary } from "@nanoforge-dev/network-client";

import { Position2D } from "../components/nf-position-2d.component";
import { Velocity2D } from "../components/nf-velocity-2d.component";

let lastPressed: InputEnum | null = null;

export function controlPlayer(_registry: Registry, ctx: Context) {
  const input = ctx.libs.getInput<InputLibrary>();
  const network = ctx.libs.getNetwork<NetworkClientLibrary>();

  if (input.isKeyPressed(InputEnum.ArrowUp)) {
    if (lastPressed !== InputEnum.ArrowUp) {
      network.tcp.sendData(new TextEncoder().encode(JSON.stringify({ type: "input", key: "up" })));
      lastPressed = InputEnum.ArrowUp;
    }
  } else if (input.isKeyPressed(InputEnum.ArrowDown)) {
    if (lastPressed !== InputEnum.ArrowDown) {
      network.tcp.sendData(
        new TextEncoder().encode(JSON.stringify({ type: "input", key: "down" })),
      );
      lastPressed = InputEnum.ArrowDown;
    }
  } else if (input.isKeyPressed(InputEnum.ArrowLeft)) {
    if (lastPressed !== InputEnum.ArrowLeft) {
      network.tcp.sendData(
        new TextEncoder().encode(JSON.stringify({ type: "input", key: "left" })),
      );
      lastPressed = InputEnum.ArrowLeft;
    }
  } else if (input.isKeyPressed(InputEnum.ArrowRight)) {
    if (lastPressed !== InputEnum.ArrowRight) {
      network.tcp.sendData(
        new TextEncoder().encode(JSON.stringify({ type: "input", key: "right" })),
      );
      lastPressed = InputEnum.ArrowRight;
    }
  } else {
    if (lastPressed !== null) {
      network.tcp.sendData(
        new TextEncoder().encode(JSON.stringify({ type: "input", key: "stop" })),
      );
      lastPressed = null;
    }
  }
}

export function packetHandler(registry: Registry, ctx: Context) {
  const network = ctx.libs.getNetwork<NetworkClientLibrary>();
  const jsonPackets = network.tcp.getReceivedPackets().map((packet) => {
    return JSON.parse(new TextDecoder().decode(packet));
  });

  if (!jsonPackets || jsonPackets.length === 0) return;
  jsonPackets.forEach((packet) => {
    const type = packet.type;
    if (type === "move") {
      const zipper = registry.getZipper([Position2D, Velocity2D]);
      const it = zipper[packet.id];
      if (!it) return;
      it.Position.x = packet.position.x;
      it.Position.y = packet.position.y;
      it.Velocity.x = packet.velocity.x;
      it.Velocity.y = packet.velocity.y;
    }
  });
}

// * Required to generate code
export default packetHandler.name;

// * Required for the editor to display the system and generate code
export const EDITOR_SYSTEM_MANIFEST: EditorSystemManifest = {
  name: "packetHandler",
  description: "Handle demo packets",
  dependencies: ["Position2D", "Velocity2D"],
};
