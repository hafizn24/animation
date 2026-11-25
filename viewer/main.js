import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ENTRIES, BY_ID } from './registry.js';
import {
  load,
  unload,
  getManager,
  getInspector,
  resetView,
  replaceCharacter,
  setInspectorVisible,
  isInspectorVisible,
  hideError,
} from './loader.js';

const selector = document.getElementById('character-selector');
const loadingEl = document.getElementById('loading');
const inspectorButton = document.getElementById('btn-inspector');
const proceduralButton = document.getElementById('btn-procedural');
const gltfButton = document.getElementById('btn-gltf');
const resetButton = document.getElementById('btn-reset');

function buildSelector() {
  const groups = new Map();
  for (const entry of ENTRIES) {
    if (!groups.has(entry.group)) {
      const optgroup = document.createElement('optgroup');
      optgroup.label = entry.group;
      selector.appendChild(optgroup);
      groups.set(entry.group, optgroup);
    }
    const option = document.createElement('option');
    option.value = entry.id;
    option.textContent = entry.label;
    groups.get(entry.group).appendChild(option);
  }
}

async function select(id, { replaceUrl = true } = {}) {
  const entry = BY_ID.get(id);
  if (!entry) return null;
  const result = await load(entry);
  if (replaceUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set('id', id);
    window.history.replaceState(null, '', url);
  }
  return result;
}

async function loadGltf(file) {
  if (!getManager()) return;
  loadingEl.classList.add('active');
  const url = URL.createObjectURL(file);
  try {
    const gltf = await new Promise((resolve, reject) => {
      new GLTFLoader().load(url, resolve, undefined, reject);
    });
    replaceCharacter(gltf.scene);
    hideError();
  } catch (error) {
    const panel = document.getElementById('error-panel');
    panel.textContent = `Failed to load GLTF: ${error?.message || error}`;
    panel.hidden = false;
    console.error('Error loading GLTF:', error);
  } finally {
    URL.revokeObjectURL(url);
    loadingEl.classList.remove('active');
  }
}

buildSelector();

proceduralButton.addEventListener('click', () => {
  select(selector.value);
});

selector.addEventListener('change', () => {
  select(selector.value);
});

gltfButton.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.gltf,.glb';
  input.onchange = (event) => {
    const file = event.target.files?.[0];
    if (file) loadGltf(file);
  };
  input.click();
});

inspectorButton.addEventListener('click', () => {
  const visible = setInspectorVisible(!isInspectorVisible());
  inspectorButton.textContent = visible ? 'Inspector ON' : 'Inspector OFF';
  inspectorButton.classList.toggle('active', visible);
});

resetButton.addEventListener('click', () => resetView());

window.addEventListener('resize', () => getManager()?.onWindowResize?.());

window.viewer = {
  entries: ENTRIES,
  select,
  unload,
  getManager,
  getInspector,
  resetView,
};

const requested = new URL(window.location.href).searchParams.get('id');
const initial = BY_ID.has(requested) ? requested : ENTRIES[0].id;
selector.value = initial;
select(initial, { replaceUrl: false });
