import React from 'react';
import { SeasonEpisode } from '../components/SeasonEpisode.jsx';
import script from '../../../episodes/episode-10/audio-script.json';
import { createChaosScene } from './scenes/chaosScene.js';
import { createLastGaspScene } from './scenes/lastGaspScene.js';
import { createSecondPlaceScene } from './scenes/secondPlaceScene.js';

const DIRECTORS = {
  createChaosScene,
  createLastGaspScene,
  createSecondPlaceScene,
};

export const Episode10Composition = () => (
  <SeasonEpisode episode={10} script={script} directors={DIRECTORS} />
);

export const EPISODE_10_FRAMES = script.totalFrames;
