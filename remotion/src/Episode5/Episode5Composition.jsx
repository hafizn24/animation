import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Scene3D } from '../components/Scene3D.jsx';
import { SafeArea } from '../components/SafeArea.jsx';
import { Episode5Subtitles } from './components/Episode5Subtitles.jsx';
import { HookTitleE5 } from './components/HookTitleE5.jsx';
import { DebtTickerHUD } from './components/DebtTickerHUD.jsx';
import { TransitionTitleCard } from './components/TransitionTitleCard.jsx';
import { FanCommentCard } from './components/FanCommentCard.jsx';
import { HudFlash } from './components/HudFlash.jsx';
import { createAct1SacrificeScene } from './scenes/act1SacrificeScene.js';
import { createAct2RumorScene } from './scenes/act2RumorScene.js';
import { createAct3RevealScene } from './scenes/act3RevealScene.js';
import {
  ACT_1,
  ACT_2,
  ACT_3,
  ALL_CUES,
  ALL_LINES,
  BLACK,
  COMMENT_CARD,
  DEBT_HUD,
  HOOK,
  HUD_FLASH,
  SCENES,
  TITLE_CARD,
  TOTAL_FRAMES,
  isTalking,
  sceneLines,
} from './timings.js';

const DIRECTORS = {
  createAct1SacrificeScene,
  createAct2RumorScene,
  createAct3RevealScene,
};

const clampOpts = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };

const tenseVolume = (frame) => {
  const end = ACT_3.fromFrame;
  if (frame < 0 || frame >= end) return 0;
  const fadeIn = interpolate(frame, [0, 12], [0, 1], clampOpts);
  const fadeOut = interpolate(frame, [end - 24, end], [1, 0], clampOpts);
  const level = isTalking(frame) ? 0.05 : 0.16;
  return Math.min(fadeIn, level) * fadeOut;
};

const warmVolume = (frame) => {
  const start = ACT_3.fromFrame;
  const end = BLACK.fromFrame;
  if (frame < start || frame >= end) return 0;
  const fadeIn = interpolate(frame, [start, start + 24], [0, 1], clampOpts);
  const fadeOut = interpolate(frame, [end - 30, end], [1, 0], clampOpts);
  const level = isTalking(frame) ? 0.05 : 0.15;
  return Math.min(fadeIn, level) * fadeOut;
};

const CutFlash = () => {
  const frame = useCurrentFrame();
  if (frame >= 2) return null;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: `rgba(255,255,255,${0.2 * (1 - frame / 2)})`,
        pointerEvents: 'none',
      }}
    />
  );
};

/** Pure black. No title card, no credits, no CTA — the punchline cuts to silence. */
const BlackCut = () => <AbsoluteFill style={{ backgroundColor: '#000000' }} />;

export const Episode5Composition = () => (
  <AbsoluteFill style={{ backgroundColor: '#05070d' }}>
    <Audio src={staticFile('audio/bgm/tense.wav')} volume={tenseVolume} />
    <Audio src={staticFile('audio/bgm/warm.wav')} volume={warmVolume} />

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

    {SCENES.filter((scene) => scene.director).map((scene) => (
      <Sequence key={scene.id} from={scene.fromFrame} durationInFrames={scene.durationFrames}>
        <Scene3D director={DIRECTORS[scene.director]} />
        <SafeArea />
        <Episode5Subtitles
          lines={sceneLines(scene)}
          bilingual
          bottomPaddingRatio={0.28}
          sidePadding={180}
        />
        {scene.id === ACT_1.id ? (
          <>
            <HookTitleE5
              title={HOOK.title}
              pill={HOOK.pill}
              fromFrame={HOOK.fromFrame}
              toFrame={HOOK.toFrame}
            />
            <DebtTickerHUD config={DEBT_HUD} sceneFrom={scene.fromFrame} />
          </>
        ) : null}
        {scene.id === ACT_2.id ? (
          <TransitionTitleCard config={TITLE_CARD} sceneFrom={scene.fromFrame} />
        ) : null}
        {scene.id === ACT_3.id ? (
          <>
            <FanCommentCard config={COMMENT_CARD} sceneFrom={scene.fromFrame} />
            <HudFlash config={HUD_FLASH} sceneFrom={scene.fromFrame} />
          </>
        ) : null}
        <CutFlash />
      </Sequence>
    ))}

    <Sequence from={BLACK.fromFrame} durationInFrames={BLACK.durationFrames}>
      <BlackCut />
    </Sequence>
  </AbsoluteFill>
);

export const EPISODE_5_FRAMES = TOTAL_FRAMES;
