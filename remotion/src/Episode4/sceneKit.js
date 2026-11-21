import { clamp, lerp, smooth, sampleKeys, forEachLight, createSceneDirector } from '../Episode1/sceneKit.js';

export { clamp, lerp, smooth, sampleKeys, forEachLight, createSceneDirector } from '../Episode1/sceneKit.js';

export const deskSlide = (frame, { from = 0.34, to = -0.18, start = 0, duration = 34 } = {}) =>
  lerp(from, to, smooth(clamp((frame - start) / duration, 0, 1)));

export const penReach = (frame, { start = 18, duration = 24 } = {}) =>
  smooth(clamp((frame - start) / duration, 0, 1));

export function applyOfficeGrade(scene, env, mode = 'default') {
  const { lamp, hallway, ambient, hemi, fill } = env.lights || {};
  if (!lamp || !hallway) return;

  if (mode === 'scene1') {
    lamp.intensity = 8.5;
    hallway.intensity = 1.4;
    ambient.intensity = 0.3;
    hemi.intensity = 0.26;
    fill.intensity = 0.34;
  } else if (mode === 'scene2') {
    lamp.intensity = 6.2;
    hallway.intensity = 1.0;
    ambient.intensity = 0.26;
    hemi.intensity = 0.22;
    fill.intensity = 0.24;
  } else if (mode === 'silence') {
    lamp.intensity = 3.2;
    hallway.intensity = 2.0;
    ambient.intensity = 0.1;
    hemi.intensity = 0.08;
    fill.intensity = 0.06;
  } else if (mode === 'reveal') {
    lamp.intensity = 2.6;
    hallway.intensity = 7.5;
    ambient.intensity = 0.14;
    hemi.intensity = 0.12;
    fill.intensity = 0.2;
  }
}

export const easeOut = (v) => 1 - (1 - smooth(clamp(v, 0, 1))) ** 2;
