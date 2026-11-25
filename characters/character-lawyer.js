import * as THREE from 'three';
import { NewOwnerApp } from './character-new-owner.js';

/** Episode 6 lawyer: the shared NewOwner rig, charcoal suit, dark tie and glasses. */
export class LawyerApp extends NewOwnerApp {
  constructor(container) {
    super(container);
    this.name = 'Lawyer';
    this.hairStyle = 'sidePart';
    this.hairColor = 0x211d1b;
    this.outfits = {
      navyOwner: {
        sweater: 0x25282d,
        sweaterDark: 0x1b1e22,
        jeans: 0x202328,
        jeansDark: 0x171a1e,
        shoes: 0x111316,
        leather: 0x17191d,
        skin: 0xf1e5d4
      }
    };
    Object.values(this.poses).forEach((pose) => {
      pose.props.bag = false;
      pose.props.bagBack = false;
    });
  }

  createProceduralCharacter() {
    const body = super.createProceduralCharacter();
    const torso = this.characterParts.torso;
    const head = this.characterParts.head;
    if (!torso || !head || this.legalDetails) return body;

    const accent = this.createToonMaterial(0x17191d);
    const tie = this.createOutlinedMesh(new THREE.BoxGeometry(0.09, 0.42, 0.045), accent, 0.02);
    tie.position.set(0, 0, 0.285);
    tie.rotation.z = -0.025;
    torso.add(tie);
    const knot = this.createOutlinedMesh(new THREE.BoxGeometry(0.1, 0.09, 0.06), accent, 0.02);
    knot.position.set(0, 0.25, 0.29);
    torso.add(knot);

    const frameMat = new THREE.MeshBasicMaterial({ color: 0x17191d });
    [-1, 1].forEach((side) => {
      const lens = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.018, 8, 24), frameMat);
      lens.position.set(side * 0.19, 0.36, 0.43);
      head.add(lens);
    });
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.018, 0.025), frameMat);
    bridge.position.set(0, 0.36, 0.435);
    head.add(bridge);

    this.legalDetails = true;
    return body;
  }

  dispose() {
    super.dispose();
    this.legalDetails = false;
  }
}
