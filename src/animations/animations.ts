import { Easing, TimelineClip } from '../core/timeline.js';
import { Mobject, MobjectSnapshot } from '../core/mobject.js';
import { VectorInput, clamp, easeInOutCubic, toVec2 } from '../core/math.js';

export class Animation implements TimelineClip {
  readonly from: MobjectSnapshot;
  readonly to: MobjectSnapshot;

  constructor(
    readonly mobject: Mobject,
    to: MobjectSnapshot,
    readonly startTime: number,
    readonly duration: number,
    readonly easing: Easing = easeInOutCubic
  ) {
    this.from = mobject.snapshot();
    this.to = to;
  }

  apply(time: number): void {
    const raw = this.duration === 0 ? 1 : (time - this.startTime) / this.duration;
    const alpha = this.easing(clamp(raw));
    this.mobject.interpolate(this.from, this.to, alpha);
  }
}

export function create(mobject: Mobject, startTime = 0, duration = 1.5): Animation {
  const to = mobject.snapshot();
  mobject.drawProgress = 0;
  return new Animation(mobject, to, startTime, duration);
}

export function fadeIn(mobject: Mobject, startTime = 0, duration = 1): Animation {
  const to = mobject.snapshot();
  mobject.style.opacity = 0;
  return new Animation(mobject, to, startTime, duration);
}

export function fadeOut(mobject: Mobject, startTime = 0, duration = 1): Animation {
  const to = mobject.snapshot();
  to.style.opacity = 0;
  return new Animation(mobject, to, startTime, duration);
}

export function moveTo(mobject: Mobject, position: VectorInput, startTime = 0, duration = 1): Animation {
  const to = mobject.snapshot();
  to.position = toVec2(position);
  return new Animation(mobject, to, startTime, duration);
}

export function transform(mobject: Mobject, target: Mobject, startTime = 0, duration = 1.5): Animation {
  return new Animation(mobject, target.snapshot(), startTime, duration);
}

export const Create = create;
export const FadeIn = fadeIn;
export const FadeOut = fadeOut;
export const MoveTo = moveTo;
export const Transform = transform;
