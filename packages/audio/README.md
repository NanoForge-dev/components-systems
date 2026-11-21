# @nanoforge/audio

Sound effects and music, with the engine's `sound` and `music` libraries. Both start muted: the
systems below turn them on once.

- `SoundEffect` with `loadSounds`: a sound your systems play by its name, `ctx.sound.play(key)`.
- `Music` with `playMusic`: a track that plays once the entity is in the game, one per level.
- `MuteOnKey` with `muteSoundOnKey` and `muteMusicOnKey`: a key that turns the sound effects, the
  music, or both (`mutes`) on and off. `muteSoundOnKey` handles the sound effects, `muteMusicOnKey`
  the music.

Order: `muteSoundOnKey` and `muteMusicOnKey` read the input, first in the frame, after the other
input systems (`click2D`, `drag2D`, `readKeyboard2D`, `readGamepad2D`, `followMouse2D`).
`loadSounds` and `playMusic` go anywhere on the client.

A mute button, from code: give the button a `Clickable2D` (`@nanoforge/controls-2d`), and in your
system, added after `click2D`, when it is `clicked`, call
`setMuted("music", ctx.music, !isMuted("music"))`, with `setMuted` and `isMuted` from
`@nanoforge/audio/mute-state` (`"sound"` and `ctx.sound` for the sound effects). `MuteOnKey` keys
and buttons share that state.
