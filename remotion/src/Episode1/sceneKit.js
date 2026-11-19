import * as THREE from 'three';

export const FPS = 30;

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => t * t * (3 - 2 * t);

export const sampleKeys = (keys, t, ease = smooth) => {
  if (t <= keys[0][0]) return { pos: keys[0][1], target: keys[0][2], fov: keys[0][3] };
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, p0, a0, f0] = keys[i];
    const [t1, p1, a1, f1] = keys[i + 1];
    if (t <= t1) {
      const k = ease((t - t0) / Math.max(0.0001, t1 - t0));
      return {
        pos: [lerp(p0[0], p1[0], k), lerp(p0[1], p1[1], k), lerp(p0[2], p1[2], k)],
        target: [lerp(a0[0], a1[0], k), lerp(a0[1], a1[1], k), lerp(a0[2], a1[2], k)],
        fov: lerp(f0, f1, k),
      };
    }
  }
  const last = keys[keys.length - 1];
  return { pos: last[1], target: last[2], fov: last[3] };
};

export const forEachLight = (scene, fn) => scene.traverse((child) => {
  if (child.isLight) fn(child);
});

/**
 * Builds one deterministic 3D shot from the project's own environments and rigs.
 * The same renderer is reused for every frame; nothing is driven by a clock.
 */
export function createSceneDirector(renderer, config) {
  const { width, height } = config;
  const container = document.createElement('div');

  const env = new config.environment(container);
  env.setupScene();
  if (!env.camera) {
    env.camera = new THREE.PerspectiveCamera(
      config.camera.fov || 70,
      width / height,
      0.1,
      500
    );
    env.camera.position.set(...config.camera.keys[0][1]);
  }
  env.addLights();
  env.createProceduralCharacter();
  const scene = env.scene;

  if (config.grade) config.grade(scene, env);

  const actors = (config.actors || []).map((spec) => {
    const app = new spec.Class(container);
    app.setupScene();
    app.addLights();
    app.createProceduralCharacter();
    if (spec.outfit && typeof app.changeOutfit === 'function') app.changeOutfit(spec.outfit);
    if (spec.hair && typeof app.changeHairStyle === 'function') app.changeHairStyle(spec.hair);
    if (spec.pose && typeof app.setPose === 'function') app.setPose(spec.pose);

    const rig = app.character;
    rig.scale.setScalar(spec.scale || 1);
    if (spec.position) rig.position.set(...spec.position);
    if (spec.rotationY !== undefined) rig.rotation.y = spec.rotationY;
    scene.add(rig);

    return { ...spec, rig, parts: app.characterParts, app };
  });

  const extra = config.extra ? config.extra(scene, { env, actors }) : {};

  const camera = new THREE.PerspectiveCamera(
    config.camera.fov || 70,
    width / height,
    0.1,
    500
  );

  const render = (frame) => {
    const t = frame / FPS;

    actors.forEach((actor) => {
      if (actor.animate) {
        actor.animate({
          t,
          frame,
          rig: actor.rig,
          parts: actor.parts,
          app: actor.app,
          scene,
          extra,
        });
      }
    });

    if (config.onFrame) config.onFrame({ t, frame, scene, actors, extra, env });

    const sampled = sampleKeys(config.camera.keys, t, config.camera.ease);
    camera.position.set(...sampled.pos);
    camera.lookAt(...sampled.target);

    const fov = sampled.fov || config.camera.fov || 70;
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);
  };

  const dispose = () => {
    if (config.dispose) config.dispose({ scene, env, actors, extra });
    actors.forEach((actor) => {
      if (actor.app.dispose) actor.app.dispose();
    });
    if (env.dispose) env.dispose();
  };

  return { render, dispose, scene, camera, actors, extra };
}
