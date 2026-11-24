import React from 'react';
import { SeasonEpisode } from '../components/SeasonEpisode.jsx';
import script from '../../../episodes/episode-9/audio-script.json';
import { createFloodlightScene } from './scenes/floodlightScene.js';
import { createTopupLoanScene } from './scenes/topupLoanScene.js';
import { createLightsPromiseScene } from './scenes/lightsPromiseScene.js';

const DIRECTORS = {
  createFloodlightScene,
  createTopupLoanScene,
  createLightsPromiseScene,
};

export const Episode9Composition = () => (
  <SeasonEpisode episode={9} script={script} directors={DIRECTORS} />
);

export const EPISODE_9_FRAMES = script.totalFrames;
