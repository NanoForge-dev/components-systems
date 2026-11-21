import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import "@nanoforge-dev/input";
import "@nanoforge-dev/music";

import { MuteOnKey } from "../components/mute-on-key";
import { isMuted, setMuted } from "../mute-state";

/**
 * Turns the music on or off each time the key of a `MuteOnKey` is pressed, unless it mutes only
 * the sound effects.
 *
 * @remarks
 * Add it with the systems that read the input, first in the frame.
 *
 * @system
 * @side client
 */
export const muteMusicOnKey = (registry: Registry, ctx: Context) => {
  registry.getZipper([MuteOnKey]).forEach(({ MuteOnKey }) => {
    const mute = MuteOnKey as MuteOnKey;
    const down = ctx.input.isKeyPressed(mute.key) === true;
    if (down && !mute.musicHeld && mute.mutes !== "sound")
      setMuted("music", ctx.music, !isMuted("music"));
    mute.musicHeld = down;
  });
};
