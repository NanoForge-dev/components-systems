import { InputEnum } from "@nanoforge-dev/input";

/**
 * Turns the sound effects, the music, or both (`mutes`), on and off with a key. Needs the
 * `muteSoundOnKey` system for the sound effects, and the `muteMusicOnKey` system for the music.
 *
 * @remarks
 * For a mute button instead, call `setMuted` from `mute-state.ts` in your own system: see the
 * package README.
 *
 * @example
 * `new MuteOnKey(InputEnum.KeyM, "music")`: M turns the music on and off, and leaves the sounds.
 *
 * @component
 * @side client
 * @group Key color=#f0a33a - The key, and what it turns on and off.
 */
export class MuteOnKey {
  name = "MuteOnKey";

  /** Whether the key was down last frame, for `muteSoundOnKey`. */
  soundHeld = false;
  /** Whether the key was down last frame, for `muteMusicOnKey`. */
  musicHeld = false;

  constructor(
    /** The key that turns the audio on and off. @group Key */
    public key: InputEnum = InputEnum.KeyM,
    /** What the key turns on and off. @group Key */
    public mutes: "both" | "sound" | "music" = "both",
  ) {}
}
