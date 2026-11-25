import { NewOwnerApp } from './character-new-owner.js';

/** Buluh FC Boss: the shared NewOwner rig with salt-and-pepper side-part hair, warm white polo and dark trousers. */
export class BossApp extends NewOwnerApp {
  constructor(container) {
    super(container);
    this.name = 'Boss';
    this.hairStyle = 'sidePart';
    this.hairColor = 0x77736d;
    this.outfits = {
      navyOwner: {
        sweater: 0xe8e5dc,
        sweaterDark: 0xd6d2c6,
        jeans: 0x25282c,
        jeansDark: 0x1e2124,
        shoes: 0x17191d,
        leather: 0x4a3526,
        skin: 0xf1e5d4
      }
    };
    Object.values(this.poses).forEach((pose) => {
      pose.props.bag = false;
      pose.props.bagBack = false;
    });
  }
}
