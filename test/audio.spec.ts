import { InputEnum } from "@nanoforge-dev/input";
import { Music } from "@nanoforge/audio/components/music";
import { MuteOnKey } from "@nanoforge/audio/components/mute-on-key";
import { SoundEffect } from "@nanoforge/audio/components/sound-effect";
import { isMuted } from "@nanoforge/audio/mute-state";
import { loadSounds } from "@nanoforge/audio/systems/load-sounds";
import { muteMusicOnKey } from "@nanoforge/audio/systems/mute-music-on-key";
import { muteSoundOnKey } from "@nanoforge/audio/systems/mute-sound-on-key";
import { playMusic } from "@nanoforge/audio/systems/play-music";
import { describe, expect, it, vi } from "vitest";

import { fake, registry, run, spawn, useEcs } from "./helpers";

useEcs();

describe("audio", () => {
  it("loadSounds loads each sound once and unmutes the sounds once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const jump = new SoundEffect("jump", "/jump.wav");
    const missing = new SoundEffect("hit", "/missing.wav");
    spawn(jump);
    spawn(missing);
    registry.addSystem(loadSounds);

    run();
    run();

    expect(fake.sound.load).toHaveBeenCalledExactlyOnceWith("jump", "blob:/jump.wav");
    expect(jump.status).toBe("loaded");
    expect(missing.status).toBe("missing");
    expect(warn).toHaveBeenCalledOnce();
    expect(fake.sound.mute).toHaveBeenCalledOnce();
    expect(isMuted("sound")).toBe(false);
    warn.mockRestore();
  });

  it("muteSoundOnKey and muteMusicOnKey toggle their library on each press", () => {
    spawn(new MuteOnKey(InputEnum.KeyM));
    registry.addSystem(muteSoundOnKey);
    registry.addSystem(muteMusicOnKey);
    fake.keys = new Set([InputEnum.KeyM]);

    run();
    run();
    expect(isMuted("sound")).toBe(true);
    expect(isMuted("music")).toBe(false);
    expect(fake.sound.mute).toHaveBeenCalledOnce();
    expect(fake.music.mute).toHaveBeenCalledOnce();

    fake.keys = new Set();
    run();
    fake.keys = new Set([InputEnum.KeyM]);
    run();
    expect(isMuted("sound")).toBe(false);
    expect(isMuted("music")).toBe(true);
  });

  it("playMusic plays each new track once, and turns the music on only once", () => {
    const level = new Music("/level.ogg");
    spawn(level);
    spawn(new Music());
    registry.addSystem(playMusic);

    run();
    run();
    spawn(new Music("/level.ogg"));
    run();

    expect(level.status).toBe("started");
    expect(fake.music.load).toHaveBeenCalledExactlyOnceWith("/level.ogg", "blob:/level.ogg");
    expect(fake.music.play).toHaveBeenCalledTimes(2);
    // The previous test left the music muted by the player: it stays so.
    expect(fake.music.mute).not.toHaveBeenCalled();
    expect(isMuted("music")).toBe(true);
  });

  it("a 'music' MuteOnKey leaves the sounds alone, and a 'sound' one the music", () => {
    // The mute state is shared by the whole file: compare with where the tests above left it.
    const sound = isMuted("sound");
    const music = isMuted("music");
    spawn(new MuteOnKey(InputEnum.KeyM, "music"));
    spawn(new MuteOnKey(InputEnum.KeyS, "sound"));
    registry.addSystem(muteSoundOnKey);
    registry.addSystem(muteMusicOnKey);

    fake.keys = new Set([InputEnum.KeyM]);
    run();
    expect(isMuted("music")).toBe(!music);
    expect(isMuted("sound")).toBe(sound);
    expect(fake.sound.mute).not.toHaveBeenCalled();

    fake.keys = new Set([InputEnum.KeyS]);
    run();
    expect(isMuted("sound")).toBe(!sound);
    expect(isMuted("music")).toBe(!music);
    expect(fake.sound.mute).toHaveBeenCalledOnce();
    expect(fake.music.mute).toHaveBeenCalledOnce();
  });
});
