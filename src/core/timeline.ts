import { clamp } from './math.js';

export type Easing = (t: number) => number;

export interface TimelineClip {
  readonly startTime: number;
  readonly duration: number;
  apply(time: number): void;
}

export class Timeline {
  readonly clips: TimelineClip[] = [];
  duration = 0;

  add(clip: TimelineClip): this {
    this.clips.push(clip);
    this.duration = Math.max(this.duration, clip.startTime + clip.duration);
    return this;
  }

  apply(time: number): void {
    const clamped = clamp(time, 0, this.duration);
    for (const clip of this.clips) {
      if (clamped >= clip.startTime) {
        clip.apply(clamped);
      }
    }
  }
}

export class PlaybackClock extends EventTarget {
  currentTime = 0;
  isPlaying = false;
  playbackRate = 1;
  private lastFrame = 0;
  private animationFrame = 0;

  constructor(readonly timeline: Timeline) {
    super();
  }

  play(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.lastFrame = performance.now();
    this.animationFrame = requestAnimationFrame(this.tick);
    this.dispatchEvent(new Event('play'));
  }

  pause(): void {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    cancelAnimationFrame(this.animationFrame);
    this.dispatchEvent(new Event('pause'));
  }

  seek(time: number): void {
    this.currentTime = clamp(time, 0, this.timeline.duration);
    this.timeline.apply(this.currentTime);
    this.dispatchEvent(new Event('timeupdate'));
  }

  setPlaybackRate(rate: number): void {
    this.playbackRate = rate;
    this.dispatchEvent(new Event('ratechange'));
  }

  private tick = (now: number): void => {
    const delta = ((now - this.lastFrame) / 1000) * this.playbackRate;
    this.lastFrame = now;
    this.seek(this.currentTime + delta);
    if (this.currentTime >= this.timeline.duration) {
      this.pause();
      return;
    }
    this.animationFrame = requestAnimationFrame(this.tick);
  };
}
