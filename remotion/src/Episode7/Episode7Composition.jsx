import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Scene3D } from '../components/Scene3D.jsx';
import { SafeArea } from '../components/SafeArea.jsx';
import { Episode5Subtitles } from '../Episode5/components/Episode5Subtitles.jsx';
import { HookTitleE5 } from '../Episode5/components/HookTitleE5.jsx';
import { createHookPitchScene, createTrainingPitchScene } from './scenes/pitchScene.js';
import { createAgreementOfficeScene } from './scenes/officeScene.js';
import { createRumourLockerScene } from './scenes/lockerScene.js';
import {
  AGREEMENT_HUD,
  ALL_LINES,
  HOOK,
  LEAGUE_BOARD,
  OUTRO,
  SCENE_1,
  SCENE_2,
  SCENE_3,
  SCENE_4,
  TOTAL_FRAMES,
  isTalking,
} from './timings.js';

const clampOpts = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };
const GOLD = '#d8b26a';

const bgmVolume = (frame) => {
  if (frame < 0 || frame >= OUTRO.fromFrame) return 0;
  const fadeIn = interpolate(frame, [0, 12], [0, 1], clampOpts);
  const fadeOut = interpolate(frame, [OUTRO.fromFrame - 24, OUTRO.fromFrame], [1, 0], clampOpts);
  const level = isTalking(frame) ? 0.05 : 0.16;
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

const fadeOpacity = (frame, from, to, ramp = 8) => interpolate(
  frame,
  [from, from + ramp, to - ramp, to],
  [0, 1, 1, 0],
  clampOpts
);

/** Stacked agreement HUD over the club-office desk scene (frames 170-435). */
const AgreementHudOverlay = ({ frame }) => {
  if (frame < AGREEMENT_HUD.fromFrame || frame > AGREEMENT_HUD.toFrame) return null;
  const opacity = fadeOpacity(frame, AGREEMENT_HUD.fromFrame, AGREEMENT_HUD.toFrame);
  return (
    <div
      style={{
        position: 'absolute',
        top: 150,
        left: 60,
        right: 180,
        opacity,
        backgroundColor: 'rgba(12, 16, 22, 0.86)',
        border: `2px solid ${GOLD}`,
        borderRadius: 16,
        padding: '18px 24px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ fontSize: 22, color: GOLD, fontWeight: 700, letterSpacing: 1.5 }}>
        {AGREEMENT_HUD.header}
      </div>
      {AGREEMENT_HUD.lines.map((line) => (
        <div key={line} style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>{line}</div>
      ))}
    </div>
  );
};

/** Full 12-club Division 5 board revealed during the cliffhanger. */
const LeagueBoardOverlay = ({ frame }) => {
  if (frame < LEAGUE_BOARD.fromFrame || frame > LEAGUE_BOARD.toFrame) return null;
  const opacity = fadeOpacity(frame, LEAGUE_BOARD.fromFrame, LEAGUE_BOARD.toFrame, 10);
  const drop = interpolate(frame, [LEAGUE_BOARD.fromFrame, LEAGUE_BOARD.fromFrame + 14], [18, 0], clampOpts);
  return (
    <div
      style={{
        position: 'absolute',
        top: 250,
        left: 70,
        right: 190,
        opacity,
        transform: `translateY(${drop}px)`,
        backgroundColor: 'rgba(10, 12, 18, 0.92)',
        border: `2px solid ${GOLD}`,
        borderRadius: 18,
        padding: '22px 26px',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ fontSize: 26, color: GOLD, fontWeight: 700, letterSpacing: 2 }}>
        {LEAGUE_BOARD.title}
      </div>
      <div style={{ fontSize: 20, color: '#cbd5e1', letterSpacing: 1, marginTop: 6 }}>
        {LEAGUE_BOARD.subtitle}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4px 18px',
          marginTop: 14,
          textAlign: 'left',
        }}
      >
        {LEAGUE_BOARD.clubs.map((club, index) => (
          <div
            key={club}
            style={{
              fontSize: 22,
              fontWeight: index === 0 ? 800 : 600,
              color: index === 0 ? '#ffffff' : '#e2e8f0',
              letterSpacing: 0.5,
            }}
          >
            {`${index + 1}. ${club}`}
          </div>
        ))}
      </div>
    </div>
  );
};

const EndCard = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30, 66, 72], [1, 1, 1, 0], clampOpts);
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ opacity, textAlign: 'center', fontFamily: 'Georgia, serif' }}>
        <div style={{ fontSize: 64, fontWeight: 700, color: '#ffffff', letterSpacing: 2 }}>
          {OUTRO.brand}
        </div>
        <div style={{ width: 240, height: 3, backgroundColor: GOLD, margin: '20px auto' }} />
        <div style={{ fontSize: 34, color: GOLD, letterSpacing: 4, fontWeight: 700 }}>
          {OUTRO.label}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const EPISODE_7_FRAMES = TOTAL_FRAMES;

export const Episode7Composition = () => {
  const trainingDuration = OUTRO.fromFrame - SCENE_4.fromFrame;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {/* Scene 1: hook on the training pitch */}
      <Sequence from={0} durationInFrames={SCENE_1.durationFrames}>
        <Scene3D director={createHookPitchScene} />
        <CutFlash />
      </Sequence>

      {/* Scene 2: the agreement, club office */}
      <Sequence from={SCENE_2.fromFrame} durationInFrames={SCENE_2.durationFrames}>
        <Scene3D director={createAgreementOfficeScene} />
        <CutFlash />
      </Sequence>

      {/* Scene 3: the rumour, locker room */}
      <Sequence from={SCENE_3.fromFrame} durationInFrames={SCENE_3.durationFrames}>
        <Scene3D director={createRumourLockerScene} />
        <CutFlash />
      </Sequence>

      {/* Scenes 4 & 5: back on the pitch */}
      <Sequence from={SCENE_4.fromFrame} durationInFrames={trainingDuration}>
        <Scene3D director={createTrainingPitchScene} />
        <CutFlash />
      </Sequence>

      {/* HUD Overlays */}
      <SafeArea />
      <HookTitleE5 title={HOOK.title} pill={HOOK.pill} fromFrame={HOOK.fromFrame} toFrame={HOOK.toFrame} />
      <AgreementHudOverlay frame={useCurrentFrame()} />
      <LeagueBoardOverlay frame={useCurrentFrame()} />

      {/* Dual Subtitles */}
      <Episode5Subtitles lines={ALL_LINES} />

      {/* Outro EndCard */}
      <Sequence from={OUTRO.fromFrame} durationInFrames={OUTRO.durationFrames}>
        <EndCard />
      </Sequence>

      {/* Audio: BGM & SFX */}
      <Audio src={staticFile('audio/bgm/tense.wav')} volume={bgmVolume} loop />
      <Sequence from={0} durationInFrames={36}>
        <Audio src={staticFile('audio/sfx/whistle.wav')} volume={0.8} />
      </Sequence>
      <Sequence from={SCENE_2.fromFrame} durationInFrames={24}>
        <Audio src={staticFile('audio/sfx/whoosh.wav')} volume={0.6} />
      </Sequence>
      <Sequence from={SCENE_3.fromFrame} durationInFrames={24}>
        <Audio src={staticFile('audio/sfx/door.wav')} volume={0.55} />
      </Sequence>
      <Sequence from={SCENE_4.fromFrame} durationInFrames={24}>
        <Audio src={staticFile('audio/sfx/whoosh.wav')} volume={0.6} />
      </Sequence>
      <Sequence from={AGREEMENT_HUD.fromFrame} durationInFrames={24}>
        <Audio src={staticFile('audio/sfx/paper.wav')} volume={0.6} />
      </Sequence>
      <Sequence from={LEAGUE_BOARD.fromFrame} durationInFrames={24}>
        <Audio src={staticFile('audio/sfx/bass-hit.wav')} volume={0.5} />
      </Sequence>
      <Sequence from={OUTRO.fromFrame} durationInFrames={30}>
        <Audio src={staticFile('audio/sfx/bass-hit.wav')} volume={0.6} />
      </Sequence>

      {/* Audio: Voiceover Lines */}
      {ALL_LINES.map((line) => (
        <Sequence key={line.id} from={line.fromFrame} durationInFrames={line.toFrame - line.fromFrame + 6}>
          <Audio src={staticFile(`audio/tts/${line.id}.mp3`)} volume={1.0} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
