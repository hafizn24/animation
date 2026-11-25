import React from 'react';
import { SeasonEpisode } from '../components/SeasonEpisode.jsx';
import script from '../../../episodes/episode-7/audio-script.json';
import { createOtaiTauntScene } from './scenes/otaiTauntScene.js';
import { createFirstWinScene } from './scenes/firstWinScene.js';
import { createFulltimeScene } from './scenes/fulltimeScene.js';

const DIRECTORS = {
  createOtaiTauntScene,
  createFirstWinScene,
  createFulltimeScene,
};

export const Episode7Composition = () => (
  <SeasonEpisode episode={7} script={script} directors={DIRECTORS} />
);

export const EPISODE_7_FRAMES = script.totalFrames;
