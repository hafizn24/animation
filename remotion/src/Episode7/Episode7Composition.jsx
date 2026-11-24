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

const BGM = [
  { file: 'match.wav', from: 0, to: 1188, level: 0.16, duck: 0.05 },
  { file: 'warm.wav', from: 900, to: 1188, level: 0.12, duck: 0.04 },
];

export const Episode7Composition = () => (
  <SeasonEpisode episode={7} script={script} directors={DIRECTORS} bgm={BGM} />
);

export const EPISODE_7_FRAMES = script.totalFrames;
