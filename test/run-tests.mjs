import assert from 'node:assert/strict';
import { Create, Square, create, moveTo, v } from '../dist/index.js';
import { Scene } from '../dist/core/scene.js';
import { Circle } from '../dist/core/shapes.js';

function testPositionInterpolation() {
  const circle = new Circle(1).moveTo([0, 0]);
  const scene = new Scene().add(circle);
  scene.play(moveTo(circle, [2, 0], 0, 2));
  scene.seek(1);
  assert.ok(circle.position[0] > 0, 'circle should move from its origin');
  assert.ok(circle.position[0] < 2, 'circle should not reach the target halfway with easing');
  assert.equal(circle.position[1], 0);
}

function testCreateAnimation() {
  const circle = new Circle(1);
  const scene = new Scene().add(circle);
  scene.play(create(circle, 0, 2));
  scene.seek(0);
  assert.equal(circle.drawProgress, 0);
  scene.seek(2);
  assert.equal(circle.drawProgress, 1);
}

function testSeekBackwardIsDeterministic() {
  const circle = new Circle(1).moveTo([0, 0]);
  const scene = new Scene().add(circle);
  scene.play(moveTo(circle, [2, 0], 0, 2));
  scene.seek(2);
  assert.equal(circle.position[0], 2);
  scene.seek(0);
  assert.equal(circle.position[0], 0);
}

function testManimStyleSquareApi() {
  const square = new Square().shift((1).I.plus((2).J));
  const scene = new Scene().add(new Circle()).play(Create(square));
  assert.equal(scene.mobjects.includes(square), true);
  scene.seek(0);
  assert.deepEqual(square.position, [1, 2]);
  assert.equal(square.drawProgress, 0);
  scene.seek(scene.timeline.duration);
  assert.equal(square.drawProgress, 1);
  assert.deepEqual((1).I.toVec2(), [1, 0]);
  assert.deepEqual((2).J.toVec2(), [0, 2]);
  assert.deepEqual(v(1, 2).toVec2(), [1, 2]);
}

testPositionInterpolation();
testCreateAnimation();
testSeekBackwardIsDeterministic();
testManimStyleSquareApi();

function testSceneCanvasTarget() {
  const scene = new Scene('#scene');
  assert.equal(scene.canvasTarget, '#scene');
}

testSceneCanvasTarget();
console.log('All timeline tests passed.');
