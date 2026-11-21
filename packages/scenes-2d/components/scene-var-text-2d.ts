/**
 * Shows a scene var in the entity's `DrawableText2D`: a score, lives, a timer. Its text becomes
 * `template`, where `{}` is the var's value, or `-` while the var doesn't exist. Needs the
 * `showSceneVars2D` system.
 *
 * @remarks
 * Start the var with `ctx.scenes.vars.init` in the setup of the scene that owns it, such as
 * `ctx.scenes.vars.init("score", 0)`: until it exists, the text shows `-`. The app needs a
 * `SceneLibrary`.
 *
 * @example
 * `new SceneVarText2D("score", "Score {}")` shows "Score 120" while `score` is 120.
 *
 * @component
 * @side client
 * @group Text color=#e86fb0 - What is shown.
 */
export class SceneVarText2D {
  name = "SceneVarText2D";

  constructor(
    /** The scene var shown. @group Text */
    public variable = "score",
    /** The text, where `{}` is the var's value. @group Text */
    public template = "{}",
  ) {}
}
