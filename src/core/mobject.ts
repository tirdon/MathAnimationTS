import { Color, Vec2, VectorInput, WHITE, add, lerpColor, lerpVec2, scale, toVec2 } from './math.js';

export interface MobjectStyle {
  color: Color;
  fill: Color;
  opacity: number;
  strokeWidth: number;
}

export interface MobjectSnapshot {
  position: Vec2;
  rotation: number;
  scale: Vec2;
  style: MobjectStyle;
  drawProgress: number;
}

export interface Vertex2D {
  position: Vec2;
  color: Color;
}

export abstract class Mobject {
  position: Vec2 = [0, 0];
  rotation = 0;
  scale: Vec2 = [1, 1];
  style: MobjectStyle = {
    color: WHITE,
    fill: [1, 1, 1, 0],
    opacity: 1,
    strokeWidth: 0.03
  };
  drawProgress = 1;

  constructor(readonly id: string = crypto.randomUUID()) {}

  abstract clone(): Mobject;
  abstract localVertices(): Vertex2D[];

  moveTo(position: VectorInput): this {
    this.position = toVec2(position);
    return this;
  }

  shift(delta: VectorInput): this {
    this.position = add(this.position, delta);
    return this;
  }

  setColor(color: Color): this {
    this.style.color = color;
    return this;
  }

  setFill(fill: Color): this {
    this.style.fill = fill;
    return this;
  }

  setOpacity(opacity: number): this {
    this.style.opacity = opacity;
    return this;
  }

  setStrokeWidth(strokeWidth: number): this {
    this.style.strokeWidth = strokeWidth;
    return this;
  }

  copyStateFrom(other: Mobject): this {
    this.position = [...other.position];
    this.rotation = other.rotation;
    this.scale = [...other.scale];
    this.style = {
      color: [...other.style.color],
      fill: [...other.style.fill],
      opacity: other.style.opacity,
      strokeWidth: other.style.strokeWidth
    };
    this.drawProgress = other.drawProgress;
    return this;
  }

  snapshot(): MobjectSnapshot {
    return {
      position: [...this.position],
      rotation: this.rotation,
      scale: [...this.scale],
      style: {
        color: [...this.style.color],
        fill: [...this.style.fill],
        opacity: this.style.opacity,
        strokeWidth: this.style.strokeWidth
      },
      drawProgress: this.drawProgress
    };
  }

  applySnapshot(snapshot: MobjectSnapshot): this {
    this.position = [...snapshot.position];
    this.rotation = snapshot.rotation;
    this.scale = [...snapshot.scale];
    this.style = {
      color: [...snapshot.style.color],
      fill: [...snapshot.style.fill],
      opacity: snapshot.style.opacity,
      strokeWidth: snapshot.style.strokeWidth
    };
    this.drawProgress = snapshot.drawProgress;
    return this;
  }

  interpolate(from: MobjectSnapshot, to: MobjectSnapshot, alpha: number): this {
    this.position = lerpVec2(from.position, to.position, alpha);
    this.rotation = from.rotation + (to.rotation - from.rotation) * alpha;
    this.scale = lerpVec2(from.scale, to.scale, alpha);
    this.style = {
      color: lerpColor(from.style.color, to.style.color, alpha),
      fill: lerpColor(from.style.fill, to.style.fill, alpha),
      opacity: from.style.opacity + (to.style.opacity - from.style.opacity) * alpha,
      strokeWidth: from.style.strokeWidth + (to.style.strokeWidth - from.style.strokeWidth) * alpha
    };
    this.drawProgress = from.drawProgress + (to.drawProgress - from.drawProgress) * alpha;
    return this;
  }

  protected transform(vertex: Vertex2D): Vertex2D {
    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);
    const x = vertex.position[0] * this.scale[0];
    const y = vertex.position[1] * this.scale[1];
    return {
      position: [x * cos - y * sin + this.position[0], x * sin + y * cos + this.position[1]],
      color: [vertex.color[0], vertex.color[1], vertex.color[2], vertex.color[3] * this.style.opacity]
    };
  }

  vertices(): Vertex2D[] {
    const vertices = this.localVertices();
    const visible = Math.floor(vertices.length * this.drawProgress);
    return vertices.slice(0, visible).map((vertex) => this.transform(vertex));
  }

  protected quad(from: Vec2, to: Vec2, width: number, color: Color): Vertex2D[] {
    const direction = [to[0] - from[0], to[1] - from[1]] as Vec2;
    const length = Math.hypot(direction[0], direction[1]) || 1;
    const normal = scale([-direction[1] / length, direction[0] / length], width / 2);
    const a = add(from, normal);
    const b = add(to, normal);
    const c = add(to, scale(normal, -1));
    const d = add(from, scale(normal, -1));
    return [
      { position: a, color },
      { position: b, color },
      { position: c, color },
      { position: a, color },
      { position: c, color },
      { position: d, color }
    ];
  }
}

export class Group extends Mobject {
  readonly children: Mobject[] = [];

  add(...mobjects: Mobject[]): this {
    this.children.push(...mobjects);
    return this;
  }

  clone(): Group {
    const group = new Group(this.id).copyStateFrom(this);
    group.children.push(...this.children.map((child) => child.clone()));
    return group;
  }

  localVertices(): Vertex2D[] {
    return this.children.flatMap((child) => child.vertices());
  }
}
