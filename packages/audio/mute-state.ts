/** One of the engine's audio libraries: `sound` (effects) or `music`. */
export type AudioLibrary = "sound" | "music";

// shortcut: the libraries' `mute()` only toggles and they can't tell their state (Engine#520), so
// it is tracked here from their muted start; read it from the engine once it can tell.
const muted: Record<AudioLibrary, boolean> = { sound: true, music: true };
const started: Record<AudioLibrary, boolean> = { sound: false, music: false };

/** Whether the library is muted. */
export const isMuted = (library: AudioLibrary): boolean => muted[library];

/** Mutes or unmutes the library, through `api` (its `ctx.sound` or `ctx.music`). */
export const setMuted = (library: AudioLibrary, api: { mute(): void }, value: boolean): void => {
  // The player chose: `unmuteOnce` must not undo it.
  started[library] = true;
  if (muted[library] === value) return;
  muted[library] = value;
  api.mute();
};

/** Unmutes the library once, unless it was muted or unmuted before: the player may have chosen. */
export const unmuteOnce = (library: AudioLibrary, api: { mute(): void }): void => {
  if (!started[library]) setMuted(library, api, false);
};
