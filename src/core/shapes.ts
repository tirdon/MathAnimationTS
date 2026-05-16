import { Color, Vec2, VectorInput, toVec2 } from './math.js';
import { Mobject, Vertex2D } from './mobject.js';

export class Line extends Mobject {
  start: Vec2;
  end: Vec2;

  constructor(start: VectorInput, end: VectorInput, id?: string) {
    super(id);
    this.start = toVec2(start);
    this.end = toVec2(end);
  }

  clone(): Line {
    return new Line([...this.start], [...this.end], this.id).copyStateFrom(this) as Line;
  }

  localVertices(): Vertex2D[] {
    return this.quad(this.start, this.end, this.style.strokeWidth, this.style.color);
  }
}

export class Circle extends Mobject {
  constructor(public radius = 1, public segments = 96, id?: string) {
    super(id);
  }

  clone(): Circle {
    return new Circle(this.radius, this.segments, this.id).copyStateFrom(this) as Circle;
  }

  localVertices(): Vertex2D[] {
    const vertices: Vertex2D[] = [];
    for (let i = 0; i < this.segments; i += 1) {
      const a0 = (i / this.segments) * Math.PI * 2;
      const a1 = ((i + 1) / this.segments) * Math.PI * 2;
      const inner = Math.max(0, this.radius - this.style.strokeWidth);
      const p0: Vec2 = [Math.cos(a0) * this.radius, Math.sin(a0) * this.radius];
      const p1: Vec2 = [Math.cos(a1) * this.radius, Math.sin(a1) * this.radius];
      const p2: Vec2 = [Math.cos(a1) * inner, Math.sin(a1) * inner];
      const p3: Vec2 = [Math.cos(a0) * inner, Math.sin(a0) * inner];
      vertices.push(
        { position: p0, color: this.style.color },
        { position: p1, color: this.style.color },
        { position: p2, color: this.style.color },
        { position: p0, color: this.style.color },
        { position: p2, color: this.style.color },
        { position: p3, color: this.style.color }
      );
    }
    return vertices;
  }
}

export class Polygon extends Mobject {
  points: Vec2[];

  constructor(points: VectorInput[], id?: string) {
    super(id);
    this.points = points.map(toVec2);
  }

  clone(): Polygon {
    return new Polygon(this.points.map((point) => [...point]), this.id).copyStateFrom(this) as Polygon;
  }

  localVertices(): Vertex2D[] {
    if (this.points.length < 3) return [];
    const fill = this.style.fill[3] > 0 ? this.triangulate(this.points, this.style.fill) : [];
    const stroke = this.points.flatMap((point, index) => {
      const next = this.points[(index + 1) % this.points.length];
      return this.quad(point, next, this.style.strokeWidth, this.style.color);
    });
    return [...fill, ...stroke];
  }

  private triangulate(points: Vec2[], color: Color): Vertex2D[] {
    const [origin, ...rest] = points;
    const vertices: Vertex2D[] = [];
    for (let i = 0; i < rest.length - 1; i += 1) {
      vertices.push({ position: origin, color }, { position: rest[i], color }, { position: rest[i + 1], color });
    }
    return vertices;
  }
}

export class Square extends Polygon {
  constructor(public sideLength = 1.6, id?: string) {
    const half = sideLength / 2;
    super(
      [
        [-half, -half],
        [half, -half],
        [half, half],
        [-half, half]
      ],
      id
    );
  }

  clone(): Square {
    return new Square(this.sideLength, this.id).copyStateFrom(this) as Square;
  }
}

export class Axes extends Mobject {
  constructor(public width = 6, public height = 4, public tickStep = 1, id?: string) {
    super(id);
  }

  clone(): Axes {
    return new Axes(this.width, this.height, this.tickStep, this.id).copyStateFrom(this) as Axes;
  }

  localVertices(): Vertex2D[] {
    const vertices: Vertex2D[] = [];
    vertices.push(...this.quad([-this.width / 2, 0], [this.width / 2, 0], this.style.strokeWidth, this.style.color));
    vertices.push(...this.quad([0, -this.height / 2], [0, this.height / 2], this.style.strokeWidth, this.style.color));
    for (let x = -this.width / 2; x <= this.width / 2; x += this.tickStep) {
      vertices.push(...this.quad([x, -0.06], [x, 0.06], this.style.strokeWidth, this.style.color));
    }
    for (let y = -this.height / 2; y <= this.height / 2; y += this.tickStep) {
      vertices.push(...this.quad([-0.06, y], [0.06, y], this.style.strokeWidth, this.style.color));
    }
    return vertices;
  }
}
