import { Create, FadeIn, MoveTo } from '../animations/animations.js';
import { BLUE, PINK, YELLOW } from '../core/math.js';
import { Scene } from '../core/scene.js';
import { Axes, Circle, Line, Square } from '../core/shapes.js';

export function buildDemoScene(): Scene {
  const scene = new Scene('#scene');
  const axes = new Axes(7, 5, 1).setColor([0.45, 0.48, 0.58, 1]).setStrokeWidth(0.015);
  const circle = new Circle(0.75).setColor(BLUE).setStrokeWidth(0.04);
  const square = new Square(1.25).shift((1).I.plus((2).J)).setColor(YELLOW).setFill([1, 0.82, 0.24, 0.16]).setStrokeWidth(0.04);
  const diagonal = new Line([-2, -1.5], [2, 1.5]).setColor(PINK).setStrokeWidth(0.04);

  scene.add(axes, circle, square, diagonal);
  scene.play(FadeIn(axes, 0, 0.8));
  scene.play(Create(circle, 0, 1));
  scene.play(Create(square, 0, 1.2), Create(diagonal, 0.2, 1));
  scene.play(MoveTo(circle, (-2).I.plus((-1).J), 0, 1.2), MoveTo(square, (1.6).I.plus((0.2).J), 0, 1.2));
  scene.wait(0.5);
  return scene;
}
