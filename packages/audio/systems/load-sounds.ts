import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import "@nanoforge-dev/sound";

import { SoundEffect } from "../components/sound-effect";
import { unmuteOnce } from "../mute-state";

/**
 * Gives every `SoundEffect` to the sound library, once, so that systems can play it by its key.
 *
 * @remarks
 * The sound library starts muted: its first run unmutes it.
 *
 * @system
 * @side client
 */
export const loadSounds = (registry: Registry, ctx: Context) => {
  registry.getZipper([SoundEffect]).forEach(({ SoundEffect }) => {
    const sound = SoundEffect as SoundEffect;
    if (sound.status || !sound.file) return;
    try {
      ctx.sound.load(sound.key, ctx.assets.getAsset(sound.file).path);
      sound.status = "loaded";
    } catch (error) {
      // Once per sound, not every frame.
      console.warn(`No sound at "${sound.file}":`, error);
      sound.status = "missing";
    }
  });
  unmuteOnce("sound", ctx.sound);
};
