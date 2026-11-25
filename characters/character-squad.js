import { NewOwnerApp } from './character-new-owner.js';

/**
 * Reusable background squad lineup for Episode 6 crowd and team-huddle shots.
 * Every figure uses the shared NewOwner body rig and skin tone; only shirt
 * shades, scale and stance vary so extras do not read as duplicates.
 */
export class SquadVariationsApp extends NewOwnerApp {
  constructor(container) {
    super(container);
    this.name = 'Buluh FC Squad Variations';
    this.hairStyle = 'crop';
    this.outfits = {
      navyOwner: {
        sweater: 0xf1eee4,
        sweaterDark: 0xdcd8ca,
        jeans: 0x202329,
        jeansDark: 0x17191d,
        shoes: 0xf2f2ee,
        leather: 0x7a4423,
        skin: 0xf1e5d4
      }
    };
    Object.values(this.poses).forEach((pose) => {
      pose.props.bag = false;
      pose.props.bagBack = false;
    });
    this.squadClones = [];
  }

  createProceduralCharacter() {
    const hero = super.createProceduralCharacter();

    this.squadClones.forEach((clone) => this.scene?.remove(clone));
    this.squadClones = [];

    hero.position.x = -2.15;
    hero.scale.setScalar(0.91);

    const variants = [
      { x: -1.08, shirt: 0xe8e5dc, scale: 0.96, rotation: -0.08 },
      { x: 0, shirt: 0xf4f0e6, scale: 1.02, rotation: 0.04 },
      { x: 1.08, shirt: 0xe7e2d7, scale: 0.94, rotation: 0.1 },
      { x: 2.15, shirt: 0xf1eee4, scale: 1, rotation: -0.04 }
    ];

    const materialRoles = new Map();
    Object.entries(this.materials).forEach(([role, material]) => materialRoles.set(material, role));

    variants.forEach((variant, index) => {
      const clone = hero.clone(true);
      clone.name = 'Squad Player ' + (index + 2);
      clone.position.set(variant.x, 0, 0);
      clone.scale.setScalar(variant.scale);
      clone.rotation.y = variant.rotation;
      clone.traverse((object) => {
        if (!object.isMesh) return;
        object.geometry = object.geometry.clone();
        if (!object.material) return;
        const original = object.material;
        const role = materialRoles.get(original);
        object.material = Array.isArray(original)
          ? original.map((material) => material.clone())
          : original.clone();
        const mats = Array.isArray(object.material) ? object.material : [object.material];
        if (role === 'sweater' || role === 'sweaterDark') {
          mats.forEach((material) => material.color?.setHex(variant.shirt));
        }
      });
      this.scene.add(clone);
      this.squadClones.push(clone);
    });

    if (this.camera) this.camera.position.set(0, 2.35, 9.2);
    if (this.controls) {
      this.controls.target.set(0, 1.1, 0);
      this.controls.minDistance = 5;
      this.controls.maxDistance = 15;
      this.controls.update();
    }
    this.characterParts = { SquadLead: hero, ...this.characterParts };
    return hero;
  }

  dispose() {
    (this.squadClones || []).forEach((clone) => {
      this.scene?.remove(clone);
      clone.traverse((child) => {
        if (!child.isMesh) return;
        child.geometry?.dispose();
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.filter(Boolean).forEach((material) => material.dispose());
      });
    });
    this.squadClones = [];
    super.dispose();
  }
}
