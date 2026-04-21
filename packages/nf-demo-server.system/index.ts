import { type Context } from "@nanoforge-dev/common";
import { type EditorSystemManifest, type Registry } from "@nanoforge-dev/ecs-lib";
import { type NetworkServerLibrary } from "@nanoforge-dev/network-server";

import { Position2D } from "../components/nf-position-2d.component";
import { Velocity2D } from "../components/nf-velocity-2d.component";

const speed = 50;

function sendMoveAll(id: number, vel: Velocity2D, pos: Position2D, network: NetworkServerLibrary) {
  network.tcp.sendToEverybody(
    new TextEncoder().encode(
      JSON.stringify({
        type: "move",
        id: id,
        position: { x: pos.x, y: pos.y },
        velocity: { x: vel.x, y: vel.y },
      }),
    ),
  );
}

function handleClientInput(
  key: string,
  network: NetworkServerLibrary,
  zip: { Position2D: any; Velocity2D: any }[],
) {
  zip.forEach(({ Position2D, Velocity2D }, id) => {
    if (key === "up") Velocity2D.y = -speed;
    if (key === "down") Velocity2D.y = speed;
    if (key === "left") Velocity2D.x = -speed;
    if (key === "right") Velocity2D.x = speed;
    if (key === "stop") {
      Velocity2D.y = 0;
    }
    sendMoveAll(id, Velocity2D, Position2D, network);
  });
}

export function packetHandler(registry: Registry, ctx: Context) {
  const zip = registry.getZipper([Position2D, Velocity2D]);
  const network = ctx.libs.getNetwork<NetworkServerLibrary>();

  const clientPackets: Map<number, Uint8Array[]> = network.tcp.getReceivedPackets();
  clientPackets.forEach((packets) => {
    packets.forEach((packet) => {
      const data = JSON.parse(new TextDecoder().decode(packet));
      if (data.type == "input") {
        handleClientInput(data.key, network, zip);
      }
    });
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
