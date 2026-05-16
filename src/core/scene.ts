import { Animation } from '../animations/animations.js';
import { Mobject, MobjectSnapshot } from './mobject.js';
import { Timeline } from './timeline.js';

export type SceneCanvasTarget = HTMLCanvasElement | string | null;

export interface SceneRenderContext {
  time: number;
  duration: number;
  mobjects: readonly Mobject[];
}

export class Scene {
  readonly mobjects: Mobject[] = [];
  readonly timeline = new Timeline();
  private cursor = 0;
  private initialSnapshots = new Map<Mobject, MobjectSnapshot>();

  constructor(readonly canvasTarget: SceneCanvasTarget = null) {}

  add(...mobjects: Mobject[]): this {
    this.mobjects.push(...mobjects);
    this.initialSnapshots.clear();
    return this;
  }

  remove(...mobjects: Mobject[]): this {
    for (const mobject of mobjects) {
      const index = this.mobjects.indexOf(mobject);
      if (index >= 0) this.mobjects.splice(index, 1);
      this.initialSnapshots.delete(mobject);
    }
    return this;
  }

  play(...animations: Animation[]): this {
    let maxEnd = this.cursor;
    for (const animation of animations) {
      if (!this.mobjects.includes(animation.mobject)) {
        this.add(animation.mobject);
      }
      const clip = new Animation(
        animation.mobject,
        animation.to,
        this.cursor + animation.startTime,
        animation.duration,
        animation.easing
      );
      this.timeline.add(clip);
      maxEnd = Math.max(maxEnd, clip.startTime + clip.duration);
    }
    this.cursor = maxEnd;
    return this;
  }

  wait(duration = 1): this {
    this.cursor += duration;
    this.timeline.duration = Math.max(this.timeline.duration, this.cursor);
    return this;
  }

  seek(time: number): SceneRenderContext {
    this.captureInitialSnapshots();
    for (const [mobject, snapshot] of this.initialSnapshots) {
      mobject.applySnapshot(snapshot);
    }
    this.timeline.apply(time);
    return {
      time,
      duration: this.timeline.duration,
      mobjects: this.mobjects
    };
  }

  private captureInitialSnapshots(): void {
    if (this.initialSnapshots.size > 0) return;
    for (const mobject of this.mobjects) {
      this.initialSnapshots.set(mobject, mobject.snapshot());
    }
  }
}
