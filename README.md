# MathAnimationTS

MathAnimationTS is a small Manim-inspired animation framework for TypeScript. It lets you compose mathematical scenes from vector mobjects, schedule animations on a timeline, render them into a real HTML canvas with WebGPU, and control playback with a browser UI.

## Features

- **Canvas-first preview**: provide `<canvas id="scene"></canvas>`, bind it with `const scene = new Scene('#scene')`, then mount with `animation(scene)`.
- **Scene graph** with `Scene`, `Mobject`, `Group`, `Line`, `Circle`, `Square`, `Polygon`, and `Axes` primitives.
- **Manim-style animation helpers** such as `Create`, `FadeIn`, `FadeOut`, `MoveTo`, and `Transform` plus lower-case aliases.
- **Timeline playback** with seek, play, pause, playback-rate control, and deterministic scene seeking.
- **Preview renderer** that tries WebGPU first and falls back to Canvas 2D so the scene still appears in browsers without WebGPU.
- **Static demo app** showing the canvas preview, playback controls, and the source snippet that generated the scene.

## Quick start

```bash
npm run build
npm run dev
```

Open <http://localhost:4173> in a WebGPU-capable browser such as Chrome or Edge.

## HTML preview

```html
<canvas id="scene" width="1280" height="720"></canvas>
<div id="controls"></div>
<script type="module">
  import animation, { Circle, Create, Scene, Square } from './dist/index.js';

  const scene = new Scene('#scene');

  scene.add(new Circle());
  scene.play(Create(new Square().shift((1).I.plus((2).J))));

  animation(scene, { controls: '#controls' }); // use { renderer: 'canvas2d' } to force fallback preview
</script>
```

JavaScript and TypeScript cannot parse `1.I` because numeric literals need a delimiter before property access. MathAnimationTS installs non-enumerable number getters, so use `(1).I` for `[1, 0]`, `(2).J` for `[0, 2]`, and `(1).I.plus((2).J)` for `[1, 2]`. You can also use `I.times(1).plus(J.times(2))` or `v(1, 2)`.

## Scripts

- `npm run build` compiles TypeScript into `dist/`.
- `npm run dev` compiles and serves the demo at <http://localhost:4173>.
- `npm test` builds the framework and runs timeline behavior tests with Node.
