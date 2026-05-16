import { Scene } from '../core/scene.js';
import { Color } from '../core/math.js';
import { Vertex2D } from '../core/mobject.js';

export class Canvas2DRenderer {
  private context: CanvasRenderingContext2D | null = null;

  constructor(readonly canvas: HTMLCanvasElement, readonly scene: Scene) {}

  async initialize(): Promise<void> {
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not acquire a 2D canvas context for preview rendering.');
    }
    this.context = context;
  }

  render(time: number): void {
    if (!this.context) {
      throw new Error('Canvas2DRenderer has not been initialized.');
    }

    const renderContext = this.scene.seek(time);
    const vertices = renderContext.mobjects.flatMap((mobject) => mobject.vertices());
    this.clear();
    this.drawTriangles(vertices);
  }

  private clear(): void {
    if (!this.context) return;
    this.context.fillStyle = 'rgb(6 7 9)';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawTriangles(vertices: Vertex2D[]): void {
    if (!this.context) return;
    for (let i = 0; i + 2 < vertices.length; i += 3) {
      const a = this.toCanvasPoint(vertices[i]);
      const b = this.toCanvasPoint(vertices[i + 1]);
      const c = this.toCanvasPoint(vertices[i + 2]);
      this.context.beginPath();
      this.context.moveTo(a[0], a[1]);
      this.context.lineTo(b[0], b[1]);
      this.context.lineTo(c[0], c[1]);
      this.context.closePath();
      this.context.fillStyle = this.toCssColor(vertices[i].color);
      this.context.fill();
    }
  }

  private toCanvasPoint(vertex: Vertex2D): [number, number] {
    return [this.canvas.width * (0.5 + vertex.position[0] / 8), this.canvas.height * (0.5 - vertex.position[1] / 6)];
  }

  private toCssColor(color: Color): string {
    const r = Math.round(color[0] * 255);
    const g = Math.round(color[1] * 255);
    const b = Math.round(color[2] * 255);
    return `rgb(${r} ${g} ${b} / ${color[3]})`;
  }
}
