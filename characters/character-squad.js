import * as THREE from 'three';
import { EpisodeCharacterApp } from './character-base.js';

/**
 * Reusable background squad lineup for Episode 6 crowd and team-huddle shots.
 * Shares the established Buluh FC toon rig while varying shirt trims, skin
 * tones, body scale and hair silhouette so extras do not read as duplicates.
 */
export class SquadVariationsApp extends EpisodeCharacterApp {
  constructor(container) {
    super(container, {
      name: 'Buluh FC Squad Variations',
      skin: 0xb88769,
      hairColor: 0x28211c,
      hairStyle: 'crop',
      shirt: 0xf1eee4,
      trousers: 0x202329
    });
  }

  createCharacter() {
    super.createCharacter();
    const hero = this.character;
    hero.position.x = -2.15;
    hero.scale.setScalar(0.91);
    const variants = [
      { x: -1.08, shirt: 0xe8e5dc, skin: 0x9d7055, scale: 0.96, rotation: -0.08 },
      { x: 0, shirt: 0xf4f0e6, skin: 0xc18e6b, scale: 1.02, rotation: 0.04 },
      { x: 1.08, shirt: 0xe7e2d7, skin: 0x8e624d, scale: 0.94, rotation: 0.1 },
      { x: 2.15, shirt: 0xf1eee4, skin: 0xb88769, scale: 1, rotation: -0.04 }
    ];

    variants.forEach((variant, index) => {
      const clone = hero.clone(true);
      clone.name = 'Squad Player ' + (index + 2);
      clone.position.x = variant.x;
      clone.scale.setScalar(variant.scale);
      clone.rotation.y = variant.rotation;
      clone.traverse((object) => {
        if (!object.isMesh || !object.material) return;
        object.material = Array.isArray(object.material)
          ? object.material.map((material) => material.clone())
          : object.material.clone();
        const mats = Array.isArray(object.material) ? object.material : [object.material];
        if (['Torso', 'LeftShoulder', 'RightShoulder', 'LeftSleeve', 'RightSleeve'].includes(object.name)) {
          mats.forEach((material) => material.color?.setHex(variant.shirt));
        }
        if (['HeadShape', 'Neck', 'LeftArm', 'RightArm', 'LeftHand', 'RightHand'].includes(object.name)) {
          mats.forEach((material) => material.color?.setHex(variant.skin));
        }
      });
      this.scene.add(clone);
    });

    this.camera.position.set(0, 2.35, 9.2);
    this.controls.target.set(0, 1.1, 0);
    this.controls.minDistance = 5;
    this.controls.maxDistance = 15;
    this.controls.update();
    this.characterParts = { SquadLead: hero };
  }
}
