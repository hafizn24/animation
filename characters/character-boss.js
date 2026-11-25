import { EpisodeCharacterApp } from './character-base.js';

/** Buluh FC Boss: salt-and-pepper side-part hair, warm white polo, dark trousers. */
export class BossApp extends EpisodeCharacterApp {
  constructor(container) {
    super(container, {
      name: 'Boss',
      skin: 0xb98263,
      hairColor: 0x77736d,
      hairStyle: 'sidePart',
      shirt: 0xe8e5dc,
      trousers: 0x25282c,
      accent: 0xb5aa94
    });
  }
}
