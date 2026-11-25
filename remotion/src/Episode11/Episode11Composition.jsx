import React from 'react';
import { SeasonEpisode } from '../components/SeasonEpisode.jsx';
import script from '../../../episodes/episode-11/audio-script.json';
import { createBesiWajaScene } from './scenes/besiWajaScene.js';
import { createHalftimeScene } from './scenes/halftimeScene.js';
import { createArmbandRevealScene } from './scenes/armbandRevealScene.js';

const DIRECTORS = {
  createBesiWajaScene,
  createHalftimeScene,
  createArmbandRevealScene,
};

export const Episode11Composition = () => (
  <SeasonEpisode episode={11} script={script} directors={DIRECTORS} />
);

export const EPISODE_11_FRAMES = script.totalFrames;
