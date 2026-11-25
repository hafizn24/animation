import React from 'react';
import { SeasonEpisode } from '../components/SeasonEpisode.jsx';
import script from '../../../episodes/episode-6/audio-script.json';
import { createBankPromiseScene } from './scenes/bankPromiseScene.js';
import { createMatchdayOneScene } from './scenes/matchdayOneScene.js';
import { createDesperateBlockScene } from './scenes/desperateBlockScene.js';

const DIRECTORS = {
  createBankPromiseScene,
  createMatchdayOneScene,
  createDesperateBlockScene,
};

export const Episode6Composition = () => (
  <SeasonEpisode episode={6} script={script} directors={DIRECTORS} />
);

export const EPISODE_6_FRAMES = script.totalFrames;
