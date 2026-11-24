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

const BGM = [
  { file: 'match.wav', from: 0, to: 480, level: 0.16, duck: 0.05 },
  { file: 'tense.wav', from: 480, to: 1248, level: 0.13, duck: 0.04 },
];

export const Episode11Composition = () => (
  <SeasonEpisode episode={11} script={script} directors={DIRECTORS} bgm={BGM} />
);

export const EPISODE_11_FRAMES = script.totalFrames;
