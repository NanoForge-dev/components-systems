/**
 * A sound effect your systems play by its `key`, with `ctx.sound.play(key)`. Needs the
 * `loadSounds` system.
 *
 * @remarks
 * The sound library starts muted: `loadSounds` turns it on once. Add a `MuteOnKey` to let the
 * player turn it off.
 *
 * @example
 * `new SoundEffect("jump", "/sounds/jump.wav")`, then `ctx.sound.play("jump")` in your system.
 *
 * @component
 * @side client
 * @group Sound color=#36c5a0 - The sound and its name.
 */
export class SoundEffect {
  name = "SoundEffect";

  /** Whether `loadSounds` gave it to the sound library, or found no file at its path. */
  status?: "loaded" | "missing";

  constructor(
    /** The name your systems play it by. @group Sound @label Name */
    public key = "click",
    /** The sound file. @group Sound @asset .wav .mp3 .ogg */
    public file = "",
  ) {}
}
