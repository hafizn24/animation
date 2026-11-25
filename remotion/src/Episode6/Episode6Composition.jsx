import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from 'remotion';
import { SafeArea } from '../components/SafeArea.jsx';
import { Scene3D } from '../components/Scene3D.jsx';
import { EndCard } from '../shared/EndCard.jsx';
import { HookTitle } from '../shared/HookTitle.jsx';
import { SeasonHUD } from '../shared/HUD.jsx';
import { Subtitles } from '../shared/Subtitles.jsx';
import { createBankFreezeScene } from './scenes/bankScene.js';
import { createSquadScene } from './scenes/squadScene.js';
import { createTrainingCutScene } from './scenes/trainingCutScene.js';
import { createTrainingHookScene } from './scenes/trainingHookScene.js';
import { ALL_CUES, ALL_LINES, END_CARD, HUD, HOOK, SCENES, TOTAL_FRAMES, isTalking } from './timings.js';

const DIRECTORS = {
  createTrainingHookScene,
  createTrainingCutScene,
  createBankFreezeScene,
  createSquadScene,
};

const clampOpts = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };

const bedVolume = (frame, start, end, peak) => {
  if (frame < start || frame >= end) return 0;
  const fadeIn = interpolate(frame, [start, start + 16], [0, 1], clampOpts);
  const fadeOut = interpolate(frame, [end - 24, end], [1, 0], clampOpts);
  return Math.min(fadeIn, fadeOut) * (isTalking(frame) ? peak * 0.32 : peak);
};

export const Episode6Composition = () => (
  <AbsoluteFill style={{ backgroundColor: '#05070d' }}>
    <Audio src={staticFile('audio/bgm/tense.wav')} volume={(frame) => bedVolume(frame, 0, 834, 0.16)} />
    <Audio src={staticFile('audio/bgm/office.wav')} volume={(frame) => bedVolume(frame, 159, 834, 0.14)} />
    <Audio src={staticFile('audio/bgm/warm.wav')} volume={(frame) => bedVolume(frame, 834, END_CARD.fromFrame, 0.13)} />

    {ALL_LINES.map((line) => (
      <Sequence key={line.id} from={line.startFrame}>
        <Audio src={staticFile(`audio/tts/${line.id}.mp3`)} volume={1} />
      </Sequence>
    ))}
    {ALL_CUES.map((cue, index) => (
      <Sequence key={`${cue.file}-${cue.frame}-${index}`} from={cue.frame}>
        <Audio src={staticFile(`audio/sfx/${cue.file}`)} volume={cue.volume} />
      </Sequence>
    ))}

    {SCENES.map((scene) => (
      <Sequence key={scene.id} from={scene.fromFrame} durationInFrames={scene.durationFrames}>
        <Scene3D director={DIRECTORS[scene.director]} />
        <SafeArea />
      </Sequence>
    ))}

    <Subtitles lines={ALL_LINES} bilingual />
    <HookTitle title={HOOK.title} pill={HOOK.pill} fromFrame={HOOK.fromFrame} toFrame={HOOK.toFrame} />
    <Sequence from={HUD.fromFrame} durationInFrames={HUD.toFrame - HUD.fromFrame}>
      <SeasonHUD month={HUD.month} matchday={HUD.matchday} debt={HUD.debt} />
    </Sequence>

    <Sequence from={END_CARD.fromFrame} durationInFrames={TOTAL_FRAMES - END_CARD.fromFrame}>
      <EndCard episode={6} />
    </Sequence>
  </AbsoluteFill>
);

export const EPISODE_6_FRAMES = TOTAL_FRAMES;
