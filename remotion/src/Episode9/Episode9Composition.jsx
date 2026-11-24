import React from 'react';
import { SeasonEpisode } from '../components/SeasonEpisode.jsx';
import script from '../../../episodes/episode-9/audio-script.json';
import { createFloodlightScene } from './scenes/floodlightScene.js';
import { createTopupLoanScene } from './scenes/topupLoanScene.js';
import { createDebtSpikeScene } from './scenes/debtSpikeScene.js';

const DIRECTORS = {
  createFloodlightScene,
  createTopupLoanScene,
  createDebtSpikeScene,
};

const BGM = [
  { file: 'tense.wav', from: 0, to: 420, level: 0.16, duck: 0.05 },
  { file: 'office.wav', from: 420, to: 1158, level: 0.14, duck: 0.05 },
];

export const Episode9Composition = () => (
  <SeasonEpisode episode={9} script={script} directors={DIRECTORS} bgm={BGM} />
);

export const EPISODE_9_FRAMES = script.totalFrames;
