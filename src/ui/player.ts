import { Canvas2DRenderer } from '../renderers/canvas2d-renderer.js';
import { WebGPURenderer } from '../renderers/webgpu-renderer.js';
import { Scene, SceneCanvasTarget } from '../core/scene.js';
import { PlaybackClock } from '../core/timeline.js';

interface PreviewRenderer {
  initialize(): Promise<void>;
  render(time: number): void;
}

export interface AnimationMountOptions {
  controls?: HTMLElement | string | false;
  autoplay?: boolean;
  renderer?: 'auto' | 'webgpu' | 'canvas2d';
}

export class ScenePlayer {
  readonly clock: PlaybackClock;
  private renderer: PreviewRenderer;
  private renderFrame = 0;

  constructor(readonly canvas: HTMLCanvasElement, readonly scene: Scene, readonly rendererMode: AnimationMountOptions['renderer'] = 'auto') {
    this.clock = new PlaybackClock(scene.timeline);
    this.renderer = new Canvas2DRenderer(canvas, scene);
  }

  async initialize(): Promise<void> {
    this.renderer = await this.createRenderer();
    await this.renderer.initialize();
    this.clock.addEventListener('timeupdate', () => this.renderer.render(this.clock.currentTime));
    this.renderer.render(0);
  }

  play(): void {
    this.clock.play();
    this.loop();
  }

  pause(): void {
    this.clock.pause();
    cancelAnimationFrame(this.renderFrame);
  }

  seek(time: number): void {
    this.clock.seek(time);
  }

  private async createRenderer(): Promise<PreviewRenderer> {
    if (this.rendererMode === 'canvas2d') {
      return new Canvas2DRenderer(this.canvas, this.scene);
    }

    if (this.rendererMode === 'webgpu') {
      return new WebGPURenderer(this.canvas, this.scene);
    }

    const webgpu = new WebGPURenderer(this.canvas, this.scene);
    try {
      await webgpu.initialize();
      return {
        initialize: async () => undefined,
        render: (time: number) => webgpu.render(time)
      };
    } catch (error) {
      console.warn('WebGPU preview unavailable; falling back to Canvas 2D.', error);
      return new Canvas2DRenderer(this.canvas, this.scene);
    }
  }

  private loop = (): void => {
    this.renderer.render(this.clock.currentTime);
    if (this.clock.isPlaying) {
      this.renderFrame = requestAnimationFrame(this.loop);
    }
  };
}

export async function animation(scene: Scene, options?: AnimationMountOptions): Promise<ScenePlayer>;
export async function animation(target: SceneCanvasTarget, scene: Scene, options?: AnimationMountOptions): Promise<ScenePlayer>;
export async function animation(
  targetOrScene: SceneCanvasTarget | Scene,
  sceneOrOptions: Scene | AnimationMountOptions = {},
  maybeOptions: AnimationMountOptions = {}
): Promise<ScenePlayer> {
  const scene = targetOrScene instanceof Scene ? targetOrScene : (sceneOrOptions as Scene);
  const options = targetOrScene instanceof Scene ? (sceneOrOptions as AnimationMountOptions) : maybeOptions;
  const target = targetOrScene instanceof Scene ? scene.canvasTarget : targetOrScene;
  const canvas = resolveCanvas(target);
  const player = new ScenePlayer(canvas, scene, options.renderer ?? 'auto');
  await player.initialize();

  if (options.controls !== false) {
    const controls = createPlaybackControls(player);
    const host = typeof options.controls === 'string' ? document.querySelector(options.controls) : options.controls;
    (host ?? canvas.parentElement)?.append(controls);
  }

  if (options.autoplay) {
    player.play();
  }

  return player;
}

function resolveCanvas(target: SceneCanvasTarget): HTMLCanvasElement {
  const canvas = typeof target === 'string' ? document.querySelector<HTMLCanvasElement>(target) : target;
  if (!canvas) {
    throw new Error(`Canvas target ${String(target)} was not found.`);
  }
  return canvas;
}

export function createPlaybackControls(player: ScenePlayer): HTMLElement {
  const root = document.createElement('section');
  root.className = 'mat-controls';

  const playButton = document.createElement('button');
  playButton.textContent = 'Play';

  const range = document.createElement('input');
  range.type = 'range';
  range.min = '0';
  range.max = String(player.scene.timeline.duration);
  range.step = '0.01';
  range.value = '0';

  const rate = document.createElement('select');
  for (const value of [0.25, 0.5, 1, 1.5, 2]) {
    const option = document.createElement('option');
    option.value = String(value);
    option.textContent = `${value}x`;
    option.selected = value === 1;
    rate.append(option);
  }

  const time = document.createElement('span');
  time.textContent = '0.00s';

  playButton.addEventListener('click', () => {
    if (player.clock.isPlaying) {
      player.pause();
      playButton.textContent = 'Play';
    } else {
      player.play();
      playButton.textContent = 'Pause';
    }
  });

  range.addEventListener('input', () => player.seek(Number(range.value)));
  rate.addEventListener('change', () => player.clock.setPlaybackRate(Number(rate.value)));
  player.clock.addEventListener('timeupdate', () => {
    range.value = String(player.clock.currentTime);
    time.textContent = `${player.clock.currentTime.toFixed(2)}s / ${player.scene.timeline.duration.toFixed(2)}s`;
  });
  player.clock.addEventListener('pause', () => {
    playButton.textContent = 'Play';
  });

  root.append(playButton, range, rate, time);
  return root;
}
