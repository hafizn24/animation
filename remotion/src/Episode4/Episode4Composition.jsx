import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, interpolate, useCurrentFrame } from 'remotion';
import { Scene3D } from '../components/Scene3D.jsx';
import { SafeArea } from '../components/SafeArea.jsx';
import { Subtitles } from '../components/Subtitles.jsx';
import { HookTitle } from '../components/HookTitle.jsx';
import { TransferOfferHUD } from '../components/TransferOfferHUD.jsx';
import { createBombDropScene } from './scenes/bombDropScene.js';
import { createHeartSurvivalScene } from './scenes/heartSurvivalScene.js';
import { createDoorwayScene } from './scenes/doorwayScene.js';
import {
  E4,
  HUD_FROM,
  HUD_TO,
  SCENES,
  SILENCE_FROM,
  SILENCE_TO,
  TITLE_CARD,
  eventsOf,
  sceneAudio,
  sceneCues,
  sceneLines,
} from './timings.js';

const DIRECTORS = {
  createBombDropScene,
  createHeartSurvivalScene,
  createDoorwayScene,
};

const TITLE_FROM = TITLE_CARD.fromFrame;
const clampOpts = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };
const ALL_LINES = SCENES.flatMap((scene) => scene.lines);
const isTalking = (frame) =>
  ALL_LINES.some((line) => frame >= line.startFrame - 3 && frame < line.endFrame + 3);

const officeVolume = (frame) => {
  if (frame < 0 || frame >= TITLE_FROM) return 0;
  const fadeIn = interpolate(frame, [0, 12], [0, 1], clampOpts);
  const fadeOut = interpolate(frame, [TITLE_FROM - 24, TITLE_FROM], [1, 0], clampOpts);
  let level = isTalking(frame) ? 0.07 : 0.2;
  if (frame >= SILENCE_FROM - 4 && frame <= SILENCE_TO + 2) {
    level = interpolate(
      frame,
      [SILENCE_FROM - 4, SILENCE_FROM, SILENCE_TO, SILENCE_TO + 2],
      [level, 0, 0, 0.12],
      clampOpts
    );
  }
  if (frame >= SILENCE_TO) level = 0.12;
  return Math.min(fadeIn, level) * fadeOut;
};

const CutFlash = () => {
  const frame = useCurrentFrame();
  if (frame >= 2) return null;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: `rgba(255,255,255,${0.22 * (1 - frame / 2)})`,
        pointerEvents: 'none',
      }}
    />
  );
};

const EndCard = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30, 66, 72], [1, 1, 1, 0], clampOpts);
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ opacity, textAlign: 'center' }}>
        <div
          style={{
            color: '#f7f4ea',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 66,
            fontWeight: 'bold',
            letterSpacing: 6,
          }}
        >
          Buluh FC
        </div>
        <div style={{ margin: '24px auto', width: 170, height: 2, backgroundColor: '#d8b26a' }} />
        <div
          style={{
            color: '#d8b26a',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 26,
            letterSpacing: 12,
            textTransform: 'uppercase',
          }}
        >
          EPISOD 4
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Episode4Composition = () => (
  <AbsoluteFill style={{ backgroundColor: '#05070d' }}>
    <Audio src={staticFile('audio/bgm/office.wav')} volume={officeVolume} />

    {SCENES.filter((scene) => scene.director).map((scene) => (
      <Sequence key={scene.id} from={scene.fromFrame} durationInFrames={scene.durationFrames}>
        <Scene3D director={DIRECTORS[scene.director]} />
        <SafeArea />
        <Subtitles
          lines={sceneLines(scene)}
          bilingual
          bottomPaddingRatio={0.28}
          sidePadding={116}
        />
        {scene.hook ? (
          <HookTitle
            title={scene.hook.title}
            pill={scene.hook.pill}
            fromFrame={scene.hook.fromFrame}
            toFrame={scene.hook.toFrame}
          />
        ) : null}
        {eventsOf(scene, 'hud').length ? (
          <TransferOfferHUD fromFrame={HUD_FROM} toFrame={HUD_TO} sceneFrom={scene.fromFrame} />
        ) : null}
        <CutFlash />
        {sceneAudio(scene).map((audio) => (
          <Sequence key={audio.file} from={audio.frame}>
            <Audio src={staticFile(`audio/tts/${audio.file}`)} volume={1} />
          </Sequence>
        ))}
        {sceneCues(scene).map((cue, index) => (
          <Sequence key={`${cue.file}-${index}`} from={cue.frame}>
            <Audio src={staticFile(`audio/sfx/${cue.file}`)} volume={cue.volume} />
          </Sequence>
        ))}
      </Sequence>
    ))}

    <Sequence from={TITLE_CARD.fromFrame} durationInFrames={TITLE_CARD.durationFrames}>
      <EndCard />
    </Sequence>
  </AbsoluteFill>
);

export const EPISODE_4_FRAMES = E4.totalFrames;
