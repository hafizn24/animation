import React from 'react';
import { SeasonEpisode } from '../components/SeasonEpisode.jsx';
import script from '../../../episodes/episode-8/audio-script.json';
import { createTunnelBribeScene } from './scenes/tunnelBribeScene.js';
import { createBribeRevengeScene } from './scenes/bribeRevengeScene.js';
import { createTableDebtScene } from './scenes/tableDebtScene.js';

const DIRECTORS = {
  createTunnelBribeScene,
  createBribeRevengeScene,
  createTableDebtScene,
};

export const Episode8Composition = () => (
  <SeasonEpisode episode={8} script={script} directors={DIRECTORS} />
);

export const EPISODE_8_FRAMES = script.totalFrames;
