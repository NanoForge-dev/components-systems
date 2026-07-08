import { type EditorSystemManifest, type Registry } from "@nanoforge-dev/ecs-lib";

import { Position2D } from "../components/nf-position-2d.component";
import { HitboxRectangle2D } from "../components/nf-hitbox-rectangle-2d.component";
import { HitboxCircle2D } from "../components/nf-hitbox-circle-2d.component";

function checkRectangleRectangleCollision(r1: HitboxRectangle2D, p1: Position2D, r2: HitboxRectangle2D, p2: Position2D): boolean {
  return p1.x < p2.x + r2.width &&
    p1.x + r1.width > p2.x &&
    p1.y < p2.y + r2.height &&
    p1.y + r1.height > p2.y;
}

function checkCircleCircleCollision(c1: HitboxCircle2D, p1: Position2D, c2: HitboxCircle2D, p2: Position2D): boolean {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)) <= c1.radius + c2.radius
}

function checkRectangleCircleCollision(r: HitboxRectangle2D, pr: Position2D, c: HitboxCircle2D, pc: Position2D): boolean {
  let edgeX = pc.x;
  let edgeY = pc.y;

  if (pc.x < pr.x) edgeX = pr.x;
  else if (pc.x > pr.x + r.width) edgeX = pr.x + r.width;
  if (pc.y < pr.y) edgeY = pr.y;
  else if (pc.y > pr.y + r.height) edgeY = pr.y + r.height;
  return Math.sqrt(Math.pow(pc.x - edgeX, 2) + Math.pow(pc.y - edgeY, 2)) <= c.radius;
}


export function hitboxCollinding2D(registry: Registry) {
  const rectangles = registry.getIndexedZipper([Position2D, HitboxRectangle2D]);
  const circles = registry.getIndexedZipper([Position2D, HitboxCircle2D]);


  rectangles.forEach((ent: any) => {
    ent.HitboxRectangle2D.entitiesColliding.length = 0;
  });
  circles.forEach((ent: any) => {
    ent.HitboxCircle2D.entitiesColliding.length = 0;
  });
  for (let i = 0; i < rectangles.length; i++) {
    for (let k = i + 1; k < rectangles.length; k++) {
      if (checkRectangleRectangleCollision(rectangles[i].HitboxRectangle2D, rectangles[i].Position2D, rectangles[k].HitboxRectangle2D, rectangles[k].Position2D)) {
        rectangles[i].HitboxRectangle2D.entitiesColliding.push(rectangles[k].id)
        rectangles[k].HitboxRectangle2D.entitiesColliding.push(rectangles[i].id)
      }
    }
  }
  for (let i = 0; i < circles.length; i++) {
    for (let k = i + 1; k < circles.length; k++) {
      if (checkCircleCircleCollision(circles[i].HitboxCircle2D, circles[i].Position2D, circles[k].HitboxCircle2D, circles[k].Position2D)) {
        circles[i].HitboxCircle2D.entitiesColliding.push(circles[k].id)
        circles[k].HitboxCircle2D.entitiesColliding.push(circles[i].id)
      }
    }
  }
  rectangles.forEach(({ id: rectangleId, Position2D: rectanglePostion, HitboxRectangle2D }) => {
    circles.forEach(({ id: circleId, Position2D: circlePostion, HitboxCircle2D }) => {
      if (circleId !== rectangleId && checkRectangleCircleCollision(HitboxRectangle2D, rectanglePostion, HitboxCircle2D, circlePostion)) {
        HitboxRectangle2D.entitiesColliding.push(circleId)
        HitboxCircle2D.entitiesColliding.push(rectangleId)
      }
    });
  });
}

// * Required to generate code
export default hitboxCollinding2D.name;

// * Required for the editor to display the system and generate code
export const EDITOR_SYSTEM_MANIFEST: EditorSystemManifest = {
  name: "hitboxCollinding2D",
  description: "Detect collisions between hitbox components and populate entitiesColliding lists",
  dependencies: ["Position2D", "HitboxRectangle2D", "HitboxCircle2D"],
};
