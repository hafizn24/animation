import React from 'react';
import { SeasonEpisode } from '../components/SeasonEpisode.jsx';
import script from '../../../episodes/episode-6/audio-script.json';
import { createBankPromiseScene } from './scenes/bankPromiseScene.js';
import { createMatchdayOneScene } from './scenes/matchdayOneScene.js';
import { createDesperateBlockScene } from './scenes/desperateBlockScene.js';

const DIRECTORS = {
  createBankPromiseScene,
  createMatchdayOneScene,
  createDesperateBlockScene,
};

const BGM = [
  { file: 'office.wav', from: 0, to: 420, level: 0.15, duck: 0.05 },
  { file: 'match.wav', from: 420, to: 1218, level: 0.18, duck: 0.05 },
];

export const Episode6Composition = () => (
  <SeasonEpisode episode={6} script={script} directors={DIRECTORS} bgm={BGM} />
);

export const EPISODE_6_FRAMES = script.totalFrames;
