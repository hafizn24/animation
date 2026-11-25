import { CharacterInspector } from '../Inspector.js';

const container = document.getElementById('canvas-container');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error-panel');

let manager = null;
let inspector = null;
let loadCounter = 0;
let inspectorVisible = true;

function disposeMaterial(material) {
  for (const value of Object.values(material)) {
    if (value && value.isTexture) value.dispose();
  }
  if (material.uniforms) {
    for (const uniform of Object.values(material.uniforms)) {
      const value = uniform?.value;
      if (value && value.isTexture) value.dispose();
    }
  }
  material.dispose();
}

function disposeScene(scene) {
  if (!scene) return;
  scene.traverse((child) => {
    if (!child.isMesh && !child.isPoints && !child.isLine) return;
    child.geometry?.dispose();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      if (material) disposeMaterial(material);
    }
  });
}

function release(instance) {
  if (!instance) return;
  instance._dead = true;
  instance.dispose?.();
  disposeScene(instance.scene);
  const renderer = instance.renderer;
  renderer?.domElement?.remove();
  renderer?.dispose();
  renderer?.forceContextLoss?.();
}

export function unload() {
  if (!manager) return;
  const instance = manager;
  manager = null;
  inspector?.inspectorPanel?.remove();
  inspector = null;
  release(instance);
}

function showError(entry, error) {
  const message = error?.message || String(error);
  errorEl.textContent = `Failed to load ${entry?.id || 'entry'}: ${message}`;
  errorEl.hidden = false;
  console.error(`Viewer load failed for ${entry?.id || 'entry'}:`, error);
}

export function hideError() {
  errorEl.hidden = true;
  errorEl.textContent = '';
}

export function getManager() {
  return manager;
}

export function getInspector() {
  return inspector;
}

export function setInspectorVisible(visible) {
  inspectorVisible = visible;
  if (inspector?.inspectorPanel) {
    inspector.inspectorPanel.style.display = visible ? 'block' : 'none';
  }
  return inspectorVisible;
}

export function isInspectorVisible() {
  return inspectorVisible;
}

export async function load(entry) {
  const token = ++loadCounter;
  hideError();
  loadingEl.classList.add('active');
  try {
    unload();
    const module = await import(entry.module);
    const ViewClass = module[entry.exportName];
    if (typeof ViewClass !== 'function') {
      throw new Error(`${entry.exportName} is not exported by ${entry.module}`);
    }
    const instance = new ViewClass(container);
    await instance.init();

    if (token !== loadCounter) {
      release(instance);
      return null;
    }

    manager = instance;
    if (manager.character?.userData) {
      manager.character.userData.charName = entry.name || entry.label;
    }
    inspector = new CharacterInspector(manager);
    inspector.createPanel(container);
    inspector.character = manager.character;
    inspector.selectedObject = null;
    inspector.update();
    setInspectorVisible(inspectorVisible);
    window.inspector = inspector;
    return manager;
  } catch (error) {
    showError(entry, error);
    return null;
  } finally {
    if (token === loadCounter) loadingEl.classList.remove('active');
  }
}

export function resetView() {
  if (!manager?.camera || !manager?.controls) return;
  if (manager.homeCamera) {
    manager.camera.position.set(...manager.homeCamera);
    manager.controls.target.set(...manager.homeTarget);
  } else {
    manager.camera.position.set(3, 2, 3);
    manager.controls.target.set(0, 1, 0);
  }
  manager.controls.update();
}

export function replaceCharacter(object) {
  if (!manager?.scene) return false;
  if (manager.character) {
    manager.scene.remove(manager.character);
    manager.character.traverse((child) => {
      if (!child.isMesh) return;
      child.geometry?.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const material of materials) {
        if (material) disposeMaterial(material);
      }
    });
  }
  manager.character = object;
  manager.characterParts = {};
  manager.scene.add(object);
  if (inspector) {
    inspector.character = object;
    inspector.selectedObject = null;
    inspector.update();
  }
  return true;
}
