import assert from 'node:assert';
import { App } from './characters/character-default.js';
import { ChairmanApp } from './characters/character-chairman.js';
import { NewOwnerApp } from './characters/character-new-owner.js';
import { CharacterInspector } from './Inspector.js';

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
assert.ok(inspector.inspectorPanel.innerHTML.includes('Object 0'), 'lists child objects');

inspector.selectObject(2);
assert.strictEqual(inspector.selectedObject, char.children[2], 'selection works');

manager.resetScene();
assert.ok(manager.character, 'resetScene rebuilds character');
assert.strictEqual(manager.character.children.length, 7, 'rebuilt character has 7 part groups');
assert.strictEqual(manager.scene.children.filter(c => c.isLight).length, 2, 'resetScene restores 2 lights');

assert.strictEqual(inspector.sanitize('abc'), 'NaN', 'sanitize NaN');
assert.strictEqual(inspector.sanitize(1.23456), '1.235', 'sanitize rounds');

// --- Special characters collection (Chairman & New Owner) ---
for (const [Cls, label, poses] of [
  [ChairmanApp, 'Chairman', ['idle', 'walk', 'stride', 'thoughtful', 'gavel', 'pipe']],
  [NewOwnerApp, 'NewOwner', ['idle', 'walkA', 'walkB', 'walkC', 'handshake', 'document', 'coffee', 'keys']],
]) {
  const special = new Cls(container);
  special.setupScene();
  special.addLights();

  const body = special.createProceduralCharacter();
  assert.strictEqual(body.children.length, 7, `${label} has 7 part groups`);
  assert.ok(body.name === label, `${label} root is named`);

  // Every pose in the library applies without throwing and moves the rig
  for (const pose of poses) {
    special.setPose(pose);
    assert.strictEqual(special.currentPose, pose, `${label} pose "${pose}" applied`);
  }

  special.setPose('idle');
  special.dispose();
  assert.strictEqual(special.character, null, `${label} disposes cleanly`);
}

console.log('ALL CHECKS PASSED');
