import { EpisodeCharacterApp } from './character-base.js';

/** Episode 6 lawyer: formal charcoal suit, white shirt, dark tie and glasses. */
export class LawyerApp extends EpisodeCharacterApp {
  constructor(container) {
    super(container, {
      name: 'Lawyer',
      skin: 0xb98b70,
      hairColor: 0x211d1b,
      hairStyle: 'sidePart',
      shirt: 0x25282d,
      trousers: 0x202328,
      accent: 0x17191d,
      tie: true,
      glasses: true
    });
  }
}
