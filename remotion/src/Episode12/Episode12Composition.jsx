import React from 'react';
import { SeasonEpisode } from '../components/SeasonEpisode.jsx';
import script from '../../../episodes/episode-12/audio-script.json';
import { createComebackScene } from './scenes/comebackScene.js';
import { createWinnerScene } from './scenes/winnerScene.js';
import { createLunasScene } from './scenes/lunasScene.js';

const DIRECTORS = {
  createComebackScene,
  createWinnerScene,
  createLunasScene,
};

const BGM = [
  { file: 'match.wav', from: 0, to: 900, level: 0.18, duck: 0.05 },
  { file: 'triumph.wav', from: 720, to: 1278, level: 0.16, duck: 0.05 },
];

export const Episode12Composition = () => (
  <SeasonEpisode episode={12} script={script} directors={DIRECTORS} bgm={BGM} />
);

export const EPISODE_12_FRAMES = script.totalFrames;
