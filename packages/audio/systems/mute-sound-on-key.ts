import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import "@nanoforge-dev/input";
import "@nanoforge-dev/sound";

import { MuteOnKey } from "../components/mute-on-key";
import { isMuted, setMuted } from "../mute-state";

/**
 * Turns the sound effects on or off each time the key of a `MuteOnKey` is pressed, unless it
 * mutes only the music.
 *
 * @remarks
 * Add it with the systems that read the input, first in the frame.
 *
 * @system
 * @side client
 */
export const muteSoundOnKey = (registry: Registry, ctx: Context) => {
  registry.getZipper([MuteOnKey]).forEach(({ MuteOnKey }) => {
    const mute = MuteOnKey as MuteOnKey;
    const down = ctx.input.isKeyPressed(mute.key) === true;
    if (down && !mute.soundHeld && mute.mutes !== "music")
      setMuted("sound", ctx.sound, !isMuted("sound"));
    mute.soundHeld = down;
  });
};
