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

const BGM = [
  { file: 'match.wav', from: 0, to: 930, level: 0.18, duck: 0.05 },
  { file: 'triumph.wav', from: 720, to: 1218, level: 0.12, duck: 0.04 },
];

export const Episode10Composition = () => (
  <SeasonEpisode episode={10} script={script} directors={DIRECTORS} bgm={BGM} />
);

export const EPISODE_10_FRAMES = script.totalFrames;
