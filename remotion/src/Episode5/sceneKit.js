import { forEachLight } from '../Episode1/sceneKit.js';

export { clamp, lerp, smooth, sampleKeys, forEachLight, createSceneDirector } from '../Episode1/sceneKit.js';

export const easeOut = (v) => 1 - (1 - v) * (1 - v);

/** Warm office grade shared with Episode 4's ClubOffice set. */
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
  } else if (mode === 'reveal') {
    lamp.intensity = 2.8;
    hallway.intensity = 6.4;
    ambient.intensity = 0.16;
    hemi.intensity = 0.12;
    fill.intensity = 0.22;
  }
}

/** Pull the bright inspection-light locker room down to a cinematic level. */
export function applyLockerGrade(scene, mode = 'default') {
  forEachLight(scene, (light) => {
    if (light.isAmbientLight) light.intensity = 0.4;
    if (light.isHemisphereLight) light.intensity = 0.26;
    if (light.isDirectionalLight) light.intensity = light.castShadow ? 0.4 : 0.14;
    if (light.isPointLight) light.intensity = 9;
  });

  if (mode === 'reveal') {
    forEachLight(scene, (light) => {
      if (light.isAmbientLight) light.intensity = 0.2;
      if (light.isHemisphereLight) light.intensity = 0.12;
      if (light.isDirectionalLight) light.intensity = light.castShadow ? 0.18 : 0.08;
      if (light.isPointLight) light.intensity = 5;
    });
  }
}
