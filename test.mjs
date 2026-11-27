import assert from 'node:assert';
import * as THREE from 'three';
import { App } from './characters/character-default.js';
import { SuitOutfitApp } from './characters/character-suit.js';
import { SoccerCoachOutfitApp } from './characters/character-coach.js';
import { SoccerOutfitApp } from './characters/character-soccer.js';
import { AnotherCasualOutfitApp } from './characters/character-casual.js';
import { ChairmanApp } from './characters/character-chairman.js';
import { NewOwnerApp } from './characters/character-new-owner.js';
import { SponsorApp } from './characters/character-sponsor.js';
import { KarimApp } from './characters/character-karim.js';
import { AzamApp } from './characters/character-azam.js';
import { ClubOfficeApp } from './environments/club-office.js';
import { HAIR_STYLES } from './characters/character-hair.js';
import { CharacterInspector } from './Inspector.js';
import {
  createArmbandTexture,
  createBackNameTexture,
  createFrontNameTexture,
  createStripedTexture,
} from './characters/core/kits.js';
import { SHARED_POSES, WALK_POSES } from './characters/core/poses.js';
import { CHARACTER_IDS, createActor } from './characters/index.js';
import { ENVIRONMENT_IDS, createEnvironment } from './environments/index.js';
import { createStage, sampleKeys, FPS } from './remotion/src/scene/stageKit.js';

// Minimal canvas stub so the canvas-textured characters can build in Node
if (typeof globalThis.document === 'undefined') {
  const ctx = new Proxy({}, {
    get: (t, p) => {
      if (p === 'createLinearGradient' || p === 'createRadialGradient') {
        return () => ({ addColorStop() {} });
      }
      return () => {};
    },
    set: () => true,
  });
  globalThis.document = {
    createElement: () => ({ width: 0, height: 0, getContext: () => ctx }),
  };
}

const container = { clientWidth: 800, clientHeight: 600, appendChild() {}, removeChild() {} };
const manager = new App(container);

manager.setupScene();
manager.addLights();

const char = manager.createProceduralCharacter();
assert.strictEqual(char.children.length, 7, 'procedural character has 7 part groups');

const inspector = new CharacterInspector(manager);
inspector.character = char;
inspector.inspectorPanel = { innerHTML: '' };

inspector.update();
assert.ok(inspector.inspectorPanel.innerHTML.includes('Character Inspector'), 'panel renders');
assert.ok(inspector.inspectorPanel.innerHTML.includes('Head'), 'lists named child objects');

inspector.selectObject(2);
assert.strictEqual(inspector.selectedObject, char.children[2], 'selection works');

manager.resetScene();
assert.ok(manager.character, 'resetScene rebuilds character');
assert.strictEqual(manager.character.children.length, 7, 'rebuilt character has 7 part groups');
assert.strictEqual(manager.scene.children.filter(c => c.isLight).length, 2, 'resetScene restores 2 lights');

assert.strictEqual(inspector.sanitize('abc'), 'NaN', 'sanitize NaN');
assert.strictEqual(inspector.sanitize(1.23456), '1.235', 'sanitize rounds');

// --- The whole cast shares one standardised rig ---
const CAST = [
  [App, 'Default', []],
  [SuitOutfitApp, 'Suit', []],
  [SoccerCoachOutfitApp, 'Coach', []],
  [SoccerOutfitApp, 'Soccer', []],
  [AnotherCasualOutfitApp, 'Casual', []],
  [ChairmanApp, 'Chairman', ['idle', 'walk', 'stride', 'thoughtful', 'gavel', 'pipe']],
  [NewOwnerApp, 'NewOwner', ['idle', 'walkA', 'walkB', 'walkC', 'handshake', 'document', 'coffee', 'keys']],
  [SponsorApp, 'Sponsor', ['idle', 'walk', 'dismiss', 'offer', 'phone', 'checkWatch']],
];

for (const [Cls, label, poses] of CAST) {
  const actor = new Cls(container);
  actor.setupScene();
  actor.addLights();

  const body = actor.createProceduralCharacter();
  assert.strictEqual(body.children.length, 7, `${label} has 7 part groups`);

  // Every character wears a hairstyle
  const hair = actor.characterParts.head.getObjectByName('Hair');
  assert.ok(hair, `${label} has a hairstyle group`);
  assert.ok(hair.children.length > 0, `${label} hairstyle has geometry`);
  assert.ok(HAIR_STYLES.includes(actor.hairStyle), `${label} uses a known hairstyle`);

  // Hands are mittens - no separate finger meshes
  const hand = actor.characterParts.leftArm.getObjectByName('Hand');
  assert.ok(hand, `${label} has a hand group`);
  let fingers = 0;
  hand.traverse((child) => {
    if (child.isMesh && child.geometry.type === 'CapsuleGeometry') fingers++;
  });
  assert.strictEqual(fingers, 0, `${label} hand has no separate fingers`);

  // Hairstyles can be swapped
  actor.changeHairStyle('afro');
  const swapped = actor.characterParts.head.getObjectByName('Hair');
  assert.ok(swapped && swapped.children.length > 0, `${label} hairstyle can be swapped`);

  // Every pose in the library applies without throwing
  if (typeof actor.setPose === 'function') {
    for (const pose of poses) {
      actor.setPose(pose);
      assert.strictEqual(actor.currentPose, pose, `${label} pose "${pose}" applied`);
    }
    actor.setPose('idle');
  }
  actor.dispose();
  assert.strictEqual(actor.character, null, `${label} disposes cleanly`);
}

// --- Episode 4 assets: Karim rig and the ClubOffice set ---
const karim = new KarimApp(container);
karim.setupScene();
karim.addLights();
const karimBody = karim.createProceduralCharacter();
assert.strictEqual(karimBody.children.length, 7, 'Karim has 7 part groups');
assert.ok(karimBody.getObjectByName('Head').getObjectByName('Hair'), 'Karim has a hairstyle');
assert.ok(karim.characterParts.backPanel, 'Karim jersey has a back name panel');
assert.ok(karim.characterParts.frontPanel, 'Karim jersey has a front name panel');
assert.ok(karim.characterParts.boots, 'Karim carries a boots prop');
assert.ok(karim.characterParts.leftArm.getObjectByName('Hand'), 'Karim has a hand group');
karim.dispose();
assert.strictEqual(karim.character, null, 'Karim disposes cleanly');

// --- Episode 5: Azam (#7) shares Karim's rig contract ---
const azam = new AzamApp(container);
azam.setupScene();
azam.addLights();
const azamBody = azam.createProceduralCharacter();
assert.strictEqual(azamBody.children.length, 7, 'Azam has 7 part groups');
assert.ok(azamBody.getObjectByName('Head').getObjectByName('Hair'), 'Azam has a hairstyle');
assert.ok(azam.characterParts.backPanel, 'Azam jersey has a back name panel');
assert.ok(azam.characterParts.frontPanel, 'Azam jersey has a front name panel');
assert.ok(azam.characterParts.boots, 'Azam exposes the Karim-compatible boots slot');
assert.ok(azam.characterParts.leftArm.getObjectByName('Hand'), 'Azam has a hand group');
assert.strictEqual(azamBody.getObjectByName('Hair').children.length > 0, true, 'Azam quiff has geometry');
['idle', 'stride', 'reveal', 'flex', 'point'].forEach((pose) => {
  azam.setPose(pose);
  assert.strictEqual(azam.currentPose, pose, `Azam pose "${pose}" applied`);
});
azam.dispose();
assert.strictEqual(azam.character, null, 'Azam disposes cleanly');

const office = new ClubOfficeApp(container);
office.setupScene();
office.addLights();
const officeSet = office.createProceduralCharacter();
assert.ok(officeSet, 'ClubOffice builds a procedural set');
['offerSheet', 'pen', 'whiteboard', 'doorHinge', 'hallwayGlow'].forEach((key) => {
  assert.ok(office.anchors[key], `ClubOffice exposes ${key} hero prop`);
});
assert.ok(office.lights.lamp && office.lights.hallway, 'ClubOffice has lamp and hallway lights');
office.dispose();
assert.strictEqual(office.character, null, 'ClubOffice disposes cleanly');

// --- Shared kit textures paint without a real canvas ---
assert.ok(createStripedTexture(0xde1326, 0xffffff), 'striped kit texture builds');
assert.ok(createBackNameTexture('RIZAL', 10), 'back name texture builds');
assert.ok(createFrontNameTexture('RIZAL', 10), 'front name texture builds');
assert.ok(createArmbandTexture('C'), 'armband texture builds');

// --- Pose library drives the shared fallback ---
assert.ok(SHARED_POSES.idle && SHARED_POSES.talk && SHARED_POSES.thought, 'shared poses exist');
assert.ok(WALK_POSES.has('walk') && WALK_POSES.has('run'), 'walk poses exist');
assert.ok(!WALK_POSES.has('idle'), 'idle is not a walking pose');

// --- Soccer rig exposes the full football-kit contract ---
const soccer = new SoccerOutfitApp(container);
soccer.setupScene();
soccer.addLights();
soccer.createProceduralCharacter();
['backPanel', 'frontPanel', 'armband', 'boots', 'leftHand', 'rightHand'].forEach((key) => {
  assert.ok(soccer.characterParts[key], `Soccer exposes ${key}`);
});
assert.strictEqual(soccer.characterParts.backPanel.visible, false, 'print hidden by default');
assert.strictEqual(soccer.characterParts.armband.visible, false, 'armband hidden by default');
soccer.setPlayerPrint('RIZAL', 10);
assert.strictEqual(soccer.characterParts.backPanel.visible, true, 'setPlayerPrint reveals the plaque');
soccer.setArmbandVisible(true);
assert.strictEqual(soccer.characterParts.armband.visible, true, 'setArmbandVisible works');
soccer.setBootsVisible(false);
assert.strictEqual(soccer.characterParts.boots.visible, false, 'setBootsVisible works');
soccer.dispose();
assert.strictEqual(soccer.character, null, 'Soccer disposes cleanly');

// Karim ships the captain's band; Azam's stays hidden after the sale.
const karimParts = new KarimApp(container);
karimParts.setupScene();
karimParts.addLights();
karimParts.createProceduralCharacter();
assert.strictEqual(karimParts.characterParts.armband.visible, true, 'Karim wears the armband');
karimParts.dispose();
const azamParts = new AzamApp(container);
azamParts.setupScene();
azamParts.addLights();
azamParts.createProceduralCharacter();
assert.strictEqual(azamParts.characterParts.armband.visible, false, "Azam's armband is hidden");
azamParts.dispose();

// --- Every character mounts headlessly and steps deterministically ---
for (const id of CHARACTER_IDS) {
  const scene = new THREE.Scene();
  const { app, rig, parts } = await createActor(scene, id, { position: [1, 0, 2], scale: 0.9 });
  assert.strictEqual(rig.parent, scene, `${id} is injected into the scene`);
  assert.ok(parts.leftHand && parts.rightHand, `${id} exposes both hands`);
  app.update(0, FPS);
  app.update(15, FPS);
  scene.remove(rig);
  app.dispose();
  assert.strictEqual(app.character, null, `${id} disposes cleanly`);
}

// --- Every environment builds headlessly with stage metadata ---
for (const id of ENVIRONMENT_IDS) {
  const scene = new THREE.Scene();
  const { env, camera, presets } = await createEnvironment(scene, id);
  assert.ok(env.character, `${id} builds a set`);
  assert.ok(camera, `${id} exposes a camera`);
  assert.ok(env.envId, `${id} declares envId`);
  assert.strictEqual(typeof env.isIndoor, 'boolean', `${id} declares isIndoor`);
  ['minX', 'maxX', 'minZ', 'maxZ', 'floorY', 'ceilingY'].forEach((key) => {
    assert.strictEqual(typeof env.bounds[key], 'number', `${id} bounds.${key} is numeric`);
  });
  assert.deepStrictEqual(
    Object.keys(presets).sort(),
    ['detailClose', 'mediumA', 'mediumB', 'wideEstablish'],
    `${id} exposes four camera presets`
  );
  env.dispose();
  assert.strictEqual(env.character, null, `${id} disposes cleanly`);
}

// --- stageKit builds a full shot and steps it frame by frame ---
const stageSceneKeys = [
  [0, [6, 4, 8], [0, 1.2, 0], 55],
  [4, [3, 2.4, 5], [0, 1.2, 0], 45],
];
const stage = createStage({ render() {} }, {
  width: 720,
  height: 1280,
  environment: 'clubOffice',
  camera: { fov: 55, keys: stageSceneKeys },
  actors: [
    { id: 'boss', outfit: 'navyOwner', position: [0.4, 0, -1.4], pose: 'idle' },
    { id: 'karim', outfit: 'matchJersey', position: [-1.2, 0, -2.2] },
  ],
});
assert.strictEqual(stage.actors.length, 2, 'stageKit builds both actors');
assert.ok(stage.scene.children.some((c) => c.isLight), 'stage scene has lights');
assert.ok(stage.actors.every((a) => a.rig.parent === stage.scene), 'actors live in the stage scene');
stage.render(0);
stage.render(30);
assert.ok(stage.presets.wideEstablish.pos.length === 3, 'stage exposes camera presets');
stage.dispose();
assert.strictEqual(stage.env.character, null, 'stage disposes the set');
stage.actors.forEach((a, i) => assert.strictEqual(a.app.character, null, `stage actor ${i} disposed`));

// --- camera key sampling is deterministic and ordered ---
const early = sampleKeys(stageSceneKeys, 0);
const mid = sampleKeys(stageSceneKeys, 2);
const late = sampleKeys(stageSceneKeys, 99);
assert.deepStrictEqual(early.pos, stageSceneKeys[0][1], 'sampleKeys clamps below the first key');
assert.deepStrictEqual(late.pos, stageSceneKeys[stageSceneKeys.length - 1][1], 'sampleKeys clamps past the last key');
assert.ok(mid.pos[0] < early.pos[0] && mid.pos[0] > late.pos[0], 'sampleKeys interpolates between keys');

console.log('ALL CHECKS PASSED');
