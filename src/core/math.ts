export type Vec2 = readonly [number, number];
export type Color = readonly [number, number, number, number];

export interface Vec2Like {
  toVec2(): Vec2;
}

export type VectorInput = Vec2 | Vec2Like;

export class Vector2 implements Vec2Like {
  constructor(readonly x: number, readonly y: number) {}

  plus(other: VectorInput): Vector2 {
    const [x, y] = toVec2(other);
    return new Vector2(this.x + x, this.y + y);
  }

  add(other: VectorInput): Vector2 {
    return this.plus(other);
  }

  times(amount: number): Vector2 {
    return new Vector2(this.x * amount, this.y * amount);
  }

  scale(amount: number): Vector2 {
    return this.times(amount);
  }

  toVec2(): Vec2 {
    return [this.x, this.y];
  }
}

declare global {
  interface Number {
    /** Unit-i vector scaled by this number. Use `(1).I` because `1.I` is not valid JavaScript syntax. */
    readonly I: Vector2;
    /** Unit-j vector scaled by this number. Use `(2).J` because `2.J` is not valid JavaScript syntax. */
    readonly J: Vector2;
  }
}

function defineNumberVectorGetter(name: 'I' | 'J', factory: (value: number) => Vector2): void {
  if (Object.prototype.hasOwnProperty.call(Number.prototype, name)) return;
  Object.defineProperty(Number.prototype, name, {
    configurable: true,
    get() {
      return factory(Number(this));
    }
  });
}

export function installNumberVectorExtensions(): void {
  defineNumberVectorGetter('I', (value) => new Vector2(value, 0));
  defineNumberVectorGetter('J', (value) => new Vector2(0, value));
}

installNumberVectorExtensions();

export const WHITE: Color = [1, 1, 1, 1];
export const BLUE: Color = [0.25, 0.55, 1, 1];
export const YELLOW: Color = [1, 0.82, 0.24, 1];
export const PINK: Color = [1, 0.33, 0.66, 1];
export const GREEN: Color = [0.2, 0.86, 0.45, 1];

export const I = new Vector2(1, 0);
export const J = new Vector2(0, 1);
export const RIGHT = I;
export const UP = J;
export const LEFT = new Vector2(-1, 0);
export const DOWN = new Vector2(0, -1);

export function vec2(x: number, y: number): Vec2 {
  return [x, y];
}

export function v(x: number, y: number): Vector2 {
  return new Vector2(x, y);
}

export function toVec2(value: VectorInput): Vec2 {
  if (Array.isArray(value)) {
    return [value[0], value[1]];
  }
  return (value as Vec2Like).toVec2();
}

export function add(a: VectorInput, b: VectorInput): Vec2 {
  const left = toVec2(a);
  const right = toVec2(b);
  return [left[0] + right[0], left[1] + right[1]];
}

export function sub(a: VectorInput, b: VectorInput): Vec2 {
  const left = toVec2(a);
  const right = toVec2(b);
  return [left[0] - right[0], left[1] - right[1]];
}

export function scale(value: VectorInput, amount: number): Vec2 {
  const vector = toVec2(value);
  return [vector[0] * amount, vector[1] * amount];
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpVec2(a: Vec2, b: Vec2, t: number): Vec2 {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
}

export function lerpColor(a: Color, b: Color, t: number): Color {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t), lerp(a[3], b[3], t)];
}

export function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

export function easeInOutCubic(t: number): number {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
