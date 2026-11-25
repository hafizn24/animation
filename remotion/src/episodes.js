import { FootballMatch } from './FootballMatch.jsx';
import { Episode1Composition } from './Episode1/Episode1Composition.jsx';
import { Episode2Composition } from './Episode2/Episode2Composition.jsx';
import { Episode3Composition } from './Episode3/Episode3Composition.jsx';
import { Episode4Composition } from './Episode4/Episode4Composition.jsx';
import { Episode5Composition, EPISODE_5_FRAMES } from './Episode5/Episode5Composition.jsx';

export const EPISODES = [
  { id: 'FootballMatch', component: FootballMatch, frames: 300, width: 720, height: 1280 },
  { id: 'Episode1', component: Episode1Composition, frames: 2245, width: 720, height: 1280 },
  { id: 'Episode2', component: Episode2Composition, frames: 1260, width: 720, height: 1280 },
  { id: 'Episode3', component: Episode3Composition, frames: 1260, width: 720, height: 1280 },
  { id: 'Episode4', component: Episode4Composition, frames: 1530, width: 720, height: 1280 },
  { id: 'Episode5', component: Episode5Composition, frames: EPISODE_5_FRAMES, width: 1080, height: 1920 },
];
