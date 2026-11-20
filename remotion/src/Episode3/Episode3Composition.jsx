import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, interpolate, useCurrentFrame } from 'remotion';
import { Scene3D } from '../components/Scene3D.jsx';
import { SafeArea } from '../components/SafeArea.jsx';
import { Subtitles } from '../components/Subtitles.jsx';
import { HookTitle } from '../components/HookTitle.jsx';
import { ScoreboardHUD } from '../components/ScoreboardHUD.jsx';
import { createGoalOneScene } from './scenes/goalOneScene.js';
import { createGoalTwoScene } from './scenes/goalTwoScene.js';
import { createGoalThreeScene } from './scenes/goalThreeScene.js';
import { createFanScene } from './scenes/fanScene.js';
import { createCliffhangerScene } from './scenes/cliffhangerScene.js';
import {
  E3,
  HUD_GOALS,
  SCENES,
  TITLE_CARD,
  eventsOf,
  getScene,
  sceneAudio,
  sceneCues,
  sceneLines,
} from './timings.js';

/**
 * Episode 3 — 42s / 1260 frames @ 30fps.
 * All timings, copy, goal impacts, HUD flips, slow-mo, shake and SFX cues are
 * imported from episodes/episode-3/audio-script.json. No timings are duplicated.
 */
const DIRECTORS = {
  createGoalOneScene,
  createGoalTwoScene,
  createGoalThreeScene,
  createFanScene,
  createCliffhangerScene,
};

const CLIFFHANGER = getScene('season-kickoff-cliffhanger');
const WHISTLE_EVENT = eventsOf(CLIFFHANGER, 'whistle')[0];
const WHISTLE_FRAME = CLIFFHANGER.fromFrame + (WHISTLE_EVENT ? WHISTLE_EVENT.frame : 0);
const TITLE_FROM = TITLE_CARD.fromFrame;
const clampOpts = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };

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

const matchVolume = (frame) => {
  if (frame < 0 || frame >= TITLE_FROM) return 0;
  const fadeIn = interpolate(frame, [0, 18], [0, 0.16], clampOpts);
  const fadeOut = interpolate(frame, [TITLE_FROM - 36, TITLE_FROM], [1, 0], clampOpts);
  let lift = 0;
  HUD_GOALS.forEach((goal) => {
    const delta = frame - goal.absoluteFrame;
    if (delta >= 0 && delta < 24) lift = Math.max(lift, 0.09 * (1 - delta / 24));
  });
  return Math.min(fadeIn, 0.16 + lift) * fadeOut;
};

const triumphVolume = (frame) => {
  const fadeIn = interpolate(frame, [0, 8], [0, 0.5], clampOpts);
  const fadeOut = interpolate(frame, [WHISTLE_FRAME === 0 ? 0 : 24, TITLE_FROM - WHISTLE_FRAME], [1, 0], clampOpts);
  return Math.min(fadeIn, 0.5) * fadeOut;
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
          BULOH FC
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
          EPISOD 3
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Episode3Composition = () => (
  <AbsoluteFill style={{ backgroundColor: '#05070d' }}>
    <Audio src={staticFile('audio/bgm/match.wav')} volume={matchVolume} />
    <Sequence from={WHISTLE_FRAME} durationInFrames={TITLE_FROM - WHISTLE_FRAME}>
      <Audio src={staticFile('audio/bgm/triumph.wav')} volume={triumphVolume} />
    </Sequence>

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
        {eventsOf(scene, 'goal').length ? (
          <ScoreboardHUD goals={HUD_GOALS} sceneFrom={scene.fromFrame} />
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

export const EPISODE_3_FRAMES = E3.totalFrames;
