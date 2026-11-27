import * as THREE from 'three';
import { CHARACTER_REGISTRY, getCharacterClass } from '../../../characters/index.js';
import { ENVIRONMENT_REGISTRY, getEnvironmentClass } from '../../../environments/index.js';

/**
 * Registry-driven stage builder.
 *
 * Same contract as `Episode1/sceneKit.js#createSceneDirector` – it returns
 * `{ render, dispose, scene, camera, actors, extra }` and drops straight into
 * `<Scene3D director={...} />` – but environments and actors are resolved by
 * id from `characters/index.js` / `environments/index.js`, and every rig is
 * stepped through `app.update(frame, FPS)` so motion stays deterministic.
 *
 *   createStage(renderer, {
 *     width, height,
 *     environment: 'lockerRoom',
 *     camera: { fov: 60, keys: [[0, pos, target, fov], ...] },
 *     actors: [{ id: 'karim', pose: 'talk', position: [0, 0, 0] }],
 *   });
 */

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

const resolveEnvironment = (value) => (
  typeof value === 'string' ? getEnvironmentClass(value) : value || ENVIRONMENT_REGISTRY.clubOffice
);

const resolveActor = (value) => {
  if (value && typeof value === 'object') return value;
  if (typeof value === 'string') return getCharacterClass(value);
  return value || CHARACTER_REGISTRY.default;
};

/** Builds one deterministic 3D shot from the project's own sets and rigs. */
export function createStage(renderer, config) {
  const { width, height } = config;
  const container = document.createElement('div');

  const EnvironmentClass = resolveEnvironment(config.environment);
  const env = new EnvironmentClass(container);
  env.setupScene();
  if (!env.camera) {
    env.camera = new THREE.PerspectiveCamera(config.camera.fov || 70, width / height, 0.1, 500);
    env.camera.position.set(...config.camera.keys[0][1]);
  }
  env.addLights();
  env.createProceduralCharacter();
  env.applyBounds();
  const scene = env.scene;

  if (config.grade) config.grade(scene, env);

  const actors = (config.actors || []).map((spec) => {
    const ActorClass = resolveActor(spec.Class || spec.id || spec.actor);
    const app = new ActorClass(container);
    app.setupScene();
    app.addLights();
    app.createProceduralCharacter();
    if (spec.outfit && typeof app.changeOutfit === 'function') app.changeOutfit(spec.outfit);
    if (spec.hair && typeof app.changeHairStyle === 'function') app.changeHairStyle(spec.hair);
    if (spec.pose && typeof app.setPose === 'function') app.setPose(spec.pose);
    // Last-mile rig dressing (kit prints, armbands, boots) that the declarative
    // spec cannot express. Runs once, after the rig exists.
    if (spec.setup) spec.setup(app, { scene, env, rig: app.character });

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
      // Deterministic rig motion first, then any scene-authored override.
      if (actor.motion !== false && typeof actor.app.update === 'function') {
        actor.app.update(frame, FPS);
      }
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

    const keys = config.camera.keys || cameraKeysFrom(env);
    const sampled = sampleKeys(keys, t, config.camera.ease);
    camera.position.set(...sampled.pos);
    camera.lookAt(...sampled.target);

    const fov = sampled.fov || config.camera.fov || 70;
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    if (config.postCamera) config.postCamera({ camera, t, frame, scene, actors, extra, env });

    renderer.render(scene, camera);
  };

  const dispose = () => {
    if (config.dispose) config.dispose({ scene, env, actors, extra });
    actors.forEach((actor) => {
      if (actor.app.dispose) actor.app.dispose();
    });
    if (env.dispose) env.dispose();
  };

  return {
    render,
    dispose,
    scene,
    camera,
    actors,
    extra,
    env,
    presets: env.getCameraPresets(),
  };
}

/** Fallback shot list when a scene does not author its own camera keys. */
function cameraKeysFrom(env) {
  const presets = env.getCameraPresets();
  const order = ['wideEstablish', 'mediumA', 'mediumB', 'detailClose'];
  return order.map((key, index) => {
    const shot = presets[key];
    return [index * 4, shot.pos, shot.target, shot.fov];
  });
}

export { CHARACTER_REGISTRY, ENVIRONMENT_REGISTRY };
