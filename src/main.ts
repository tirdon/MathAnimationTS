import animation from './index.js';
import { buildDemoScene } from './examples/demo-scene.js';

const source = document.querySelector<HTMLElement>('#source');
const sourceTemplate = document.querySelector<HTMLScriptElement>('#scene-source');

if (source && sourceTemplate) {
  source.textContent = sourceTemplate.textContent?.trim() ?? '';
}

const scene = buildDemoScene();
animation(scene, { controls: '#controls' }).catch((error: unknown) => {
  const warning = document.createElement('pre');
  warning.className = 'mat-warning';
  warning.textContent = error instanceof Error ? error.message : String(error);
  document.querySelector('#app')?.append(warning);
});
