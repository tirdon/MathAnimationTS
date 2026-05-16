import { Scene } from '../core/scene.js';
import { Vertex2D } from '../core/mobject.js';

const shader = /* wgsl */ `
struct VertexIn {
  @location(0) position: vec2<f32>,
  @location(1) color: vec4<f32>,
};

struct VertexOut {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
};

@vertex
fn vsMain(input: VertexIn) -> VertexOut {
  var out: VertexOut;
  out.position = vec4<f32>(input.position, 0.0, 1.0);
  out.color = input.color;
  return out;
}

@fragment
fn fsMain(input: VertexOut) -> @location(0) vec4<f32> {
  return input.color;
}
`;

export class WebGPURenderer {
  private device!: GPUDevice;
  private context!: GPUCanvasContext;
  private pipeline!: GPURenderPipeline;
  private format!: GPUTextureFormat;
  private vertexBuffer!: GPUBuffer;
  private vertexCapacity = 0;

  constructor(readonly canvas: HTMLCanvasElement, readonly scene: Scene) {}

  async initialize(): Promise<void> {
    if (!navigator.gpu) {
      throw new Error('WebGPU is not available in this browser. Use Chrome, Edge, or another WebGPU-capable browser.');
    }
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error('No WebGPU adapter was found.');
    }
    this.device = await adapter.requestDevice();
    const context = this.canvas.getContext('webgpu') as GPUCanvasContext | null;
    if (!context) {
      throw new Error('Could not acquire a WebGPU canvas context.');
    }
    this.context = context;
    this.format = navigator.gpu.getPreferredCanvasFormat();
    this.context.configure({ device: this.device, format: this.format, alphaMode: 'premultiplied' });
    this.pipeline = this.device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: this.device.createShaderModule({ code: shader }),
        entryPoint: 'vsMain',
        buffers: [
          {
            arrayStride: 24,
            attributes: [
              { shaderLocation: 0, offset: 0, format: 'float32x2' },
              { shaderLocation: 1, offset: 8, format: 'float32x4' }
            ]
          }
        ]
      },
      fragment: {
        module: this.device.createShaderModule({ code: shader }),
        entryPoint: 'fsMain',
        targets: [{ format: this.format, blend: { color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha' }, alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' } } }]
      },
      primitive: { topology: 'triangle-list' }
    });
  }

  render(time: number): void {
    const context = this.scene.seek(time);
    const vertices = context.mobjects.flatMap((mobject) => mobject.vertices());
    const data = this.toFloat32(vertices);
    this.ensureVertexBuffer(data.byteLength);
    if (data.length > 0) {
      this.device.queue.writeBuffer(this.vertexBuffer, 0, data.buffer, data.byteOffset, data.byteLength);
    }
    const encoder = this.device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: this.context.getCurrentTexture().createView(),
          clearValue: { r: 0.025, g: 0.027, b: 0.035, a: 1 },
          loadOp: 'clear',
          storeOp: 'store'
        }
      ]
    });
    pass.setPipeline(this.pipeline);
    if (vertices.length > 0) {
      pass.setVertexBuffer(0, this.vertexBuffer);
      pass.draw(vertices.length);
    }
    pass.end();
    this.device.queue.submit([encoder.finish()]);
  }

  private ensureVertexBuffer(byteLength: number): void {
    if (byteLength <= this.vertexCapacity) return;
    this.vertexBuffer?.destroy();
    this.vertexCapacity = Math.max(byteLength, 1024);
    this.vertexBuffer = this.device.createBuffer({
      size: this.vertexCapacity,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });
  }

  private toFloat32(vertices: Vertex2D[]): Float32Array {
    const data = new Float32Array(vertices.length * 6);
    vertices.forEach((vertex, index) => {
      const offset = index * 6;
      data[offset] = vertex.position[0] / 4;
      data[offset + 1] = vertex.position[1] / 3;
      data[offset + 2] = vertex.color[0];
      data[offset + 3] = vertex.color[1];
      data[offset + 4] = vertex.color[2];
      data[offset + 5] = vertex.color[3];
    });
    return data;
  }
}
