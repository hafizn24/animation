import React from 'react';
import { SeasonEpisode } from '../components/SeasonEpisode.jsx';
import script from '../../../episodes/episode-12/audio-script.json';
import { createComebackScene } from './scenes/comebackScene.js';
import { createWinnerScene } from './scenes/winnerScene.js';
import { createLunasKarimScene } from './scenes/lunasKarimScene.js';

const DIRECTORS = {
  createComebackScene,
  createWinnerScene,
  createLunasKarimScene,
};

export const Episode12Composition = () => (
  <SeasonEpisode episode={12} script={script} directors={DIRECTORS} />
);

export const EPISODE_12_FRAMES = script.totalFrames;
