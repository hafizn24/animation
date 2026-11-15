import assert from 'node:assert';
import { App } from './characters/character-default.js';
import { SuitOutfitApp } from './characters/character-suit.js';
import { SoccerCoachOutfitApp } from './characters/character-coach.js';
import { SoccerOutfitApp } from './characters/character-soccer.js';
import { AnotherCasualOutfitApp } from './characters/character-casual.js';
import { ChairmanApp } from './characters/character-chairman.js';
import { NewOwnerApp } from './characters/character-new-owner.js';
import { HAIR_STYLES } from './characters/character-hair.js';
import { CharacterInspector } from './Inspector.js';

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

console.log('ALL CHECKS PASSED');
