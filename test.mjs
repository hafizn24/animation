import assert from 'node:assert';
import { App } from './characters/character-default.js';
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
assert.strictEqual(manager.character, null, 'resetScene clears character');
assert.strictEqual(manager.scene.children.filter(c => c.isLight).length, 2, 'resetScene restores 2 lights');

assert.strictEqual(inspector.sanitize('abc'), 'NaN', 'sanitize NaN');
assert.strictEqual(inspector.sanitize(1.23456), '1.235', 'sanitize rounds');

console.log('ALL CHECKS PASSED');
