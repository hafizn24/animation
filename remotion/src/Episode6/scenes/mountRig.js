export async function mountRig(scene, RigClass, outfit, { x = 0, y = 0, z = 0, rotY = 0 } = {}) {
  const rig = new RigClass(null);
  rig.scene = scene;
  rig.selectedOutfit = outfit;
  if (typeof rig.init === 'function') {
    await rig.init();
  } else if (typeof rig.createProceduralCharacter === 'function') {
    rig.character = rig.createProceduralCharacter();
    scene.add(rig.character);
  }
  if (rig.character) {
    rig.character.position.set(x, y, z);
    rig.character.rotation.y = rotY;
  }
  return rig;
}
