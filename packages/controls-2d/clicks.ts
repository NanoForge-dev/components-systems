import type { InputEnum } from "@nanoforge-dev/input";

/**
 * The mouse buttons whose current press clicked a `Clickable2D`: set by `click2D`, cleared by
 * `click2D` or `readKeyboard2D` once the button is up. `readKeyboard2D` doesn't fire such a press,
 * even once the button is gone.
 */
export const pressedOnClickable = new Set<InputEnum>();

/** Forgets the buttons of `pressedOnClickable` that are up. */
export const forgetReleased = (held: (button: InputEnum) => boolean) =>
  pressedOnClickable.forEach((button) => {
    if (!held(button)) pressedOnClickable.delete(button);
  });
