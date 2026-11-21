/**
 * Plays a music track once the entity is in the game: put one in each level or menu. Needs the
 * `playMusic` system.
 *
 * @remarks
 * One track plays at a time: a new `Music` takes over from the one before. The track keeps
 * playing after the entity is removed, until another starts (the music library has no stop yet).
 * The music library starts muted: `playMusic` turns it on once. Add a `MuteOnKey` to let the
 * player turn it off.
 *
 * @component
 * @side client
 * @group Music color=#36c5a0 - The track.
 */
export class Music {
  name = "Music";

  /** Whether `playMusic` started it, or found no file at its path. */
  status?: "started" | "missing";

  constructor(
    /** The music file. @group Music @asset .mp3 .ogg .wav */
    public file = "",
  ) {}
}
