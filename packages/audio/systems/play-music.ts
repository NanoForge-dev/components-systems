import type { Context } from "@nanoforge-dev/common";
import type { Registry } from "@nanoforge-dev/ecs";
import "@nanoforge-dev/music";

import { Music } from "../components/music";
import { unmuteOnce } from "../mute-state";

/** The files already given to the music library: each is its track's key. */
const loaded = new Set<string>();

/**
 * Starts the track of each new `Music` entity.
 *
 * @remarks
 * The music library starts muted: its first run unmutes it.
 *
 * @system
 * @side client
 */
export const playMusic = (registry: Registry, ctx: Context) => {
  registry.getZipper([Music]).forEach(({ Music }) => {
    const music = Music as Music;
    if (music.status || !music.file) return;
    try {
      if (!loaded.has(music.file)) {
        ctx.music.load(music.file, ctx.assets.getAsset(music.file).path);
        loaded.add(music.file);
      }
      ctx.music.play(music.file);
      music.status = "started";
    } catch (error) {
      console.warn(`No music at "${music.file}":`, error);
      music.status = "missing";
    }
  });
  unmuteOnce("music", ctx.music);
};
