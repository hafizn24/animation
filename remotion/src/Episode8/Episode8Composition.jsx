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

const BGM = [
  { file: 'tense.wav', from: 0, to: 480, level: 0.14, duck: 0.05 },
  { file: 'match.wav', from: 480, to: 960, level: 0.17, duck: 0.05 },
  { file: 'warm.wav', from: 960, to: 1248, level: 0.14, duck: 0.05 },
];

export const Episode8Composition = () => (
  <SeasonEpisode episode={8} script={script} directors={DIRECTORS} bgm={BGM} />
);

export const EPISODE_8_FRAMES = script.totalFrames;
