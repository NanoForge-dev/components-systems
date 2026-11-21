/**
 * Fires bullets: while `fire` is on, `fireRate` times a second along (`aimX`, `aimY`). A
 * `KeyboardControls2D` or `GamepadControls2D` fires a player's, and a `ShootAtNearest2D` a
 * turret's; your system or the server's packet handler can set `fire` and the aim. Needs
 * `Position2D`, a hitbox, the `shoot2D` system, and `showBullets2D` on the client.
 *
 * @remarks
 * Bullets start at the middle of the shooter's hitbox (its `Position2D` without one): give it a
 * hitbox the size of its sprite. Put `Shoot2D` on the entity with the hitbox: a separate gun entity
 * isn't the owner, so give it a non-empty `target`.
 *
 * A bullet hurts the `Health` tagged `target`, is destroyed on hit, and goes after `range` pixels
 * (`expireLifetimes`). With a `range` of 0, give the model a `Bounds2D` in destroy mode, which each
 * bullet copies (`keepInBounds2D`). Bullets aren't removed with their scene: remove them in its
 * teardown.
 *
 * Their look and hitbox come from the model: an entity with a `Model` and the one-word `Tag`
 * `bulletModel`, holding a hitbox and a drawable. A bullet that turns (`FaceVelocity2D`) needs a
 * `HitboxCircle2D`. Without a model: grey dots of 10 pixels.
 *
 * Server bullets aren't sent to the clients yet (`@nanoforge/network-2d`, later): networked
 * shooting needs game code for now. For one shot from code or a packet, set `fireRequested`.
 *
 * @example
 * `new Shoot2D(true, 1, 0, -1)` fires up once a second by itself.
 *
 * @component
 * @side shared
 * @group Trigger color=#9d7bff - When it fires.
 * @group Aim color=#4aa3ff - Where it fires, and what its bullets hurt.
 * @group Bullet color=#e5484d - The bullets.
 * @group Advanced hidden - Less common settings.
 */
export class Shoot2D {
  name = "Shoot2D";

  /** Seconds before it can fire again, counted down by `shoot2D`. */
  cooldown = 0;
  /** One shot this frame if it can fire, from code or a packet; cleared by `shoot2D` every frame. */
  fireRequested = false;

  constructor(
    /** Whether it fires; check it for a cannon that never stops. @group Trigger */
    public fire = false,
    /** Shots per second. @group Trigger */
    public fireRate = 3,
    /** Direction it fires in, any length; (0, 0) holds fire. @group Aim @preset vector.x */
    public aimX = 1,
    /** See `aimX`. @group Aim @preset vector.y */
    public aimY = 0,
    /** The `Tag` of what its bullets hurt and `ShootAtNearest2D` aims at; empty: anything but its shooter. @group Aim */
    public target = "",
    /** Pixels per second. @group Bullet */
    public bulletSpeed = 600,
    /** Hit points a bullet removes. @group Bullet */
    public damage = 10,
    /** Pixels a bullet flies, and how far `ShootAtNearest2D` looks; 0: no limit. @group Bullet */
    public range = 1000,
    /** Bullets per shot, fanned over `spreadAngle`: 5 for a shotgun. @group Advanced */
    public bulletsPerShot = 1,
    /** Degrees between the first and last bullet of a shot. @group Advanced */
    public spreadAngle = 0,
    /** The `Tag` word of the bullets' model. @group Advanced */
    public bulletModel = "bullet",
  ) {}
}
