import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Scene3D } from '../components/Scene3D.jsx';
import { SafeArea } from '../components/SafeArea.jsx';
import { Episode5Subtitles } from '../Episode5/components/Episode5Subtitles.jsx';
import { HookTitleE5 } from '../Episode5/components/HookTitleE5.jsx';
import { createOfficeScene } from './scenes/officeScene.js';
import { createPitchScene } from './scenes/pitchScene.js';
import {
  ALL_LINES,
  DEBT_LEDGER,
  DIVISION_HUD,
  FIXTURE_REVEAL,
  HOOK,
  OUTRO,
  SCENE_1,
  SCENE_2,
  SCENE_3,
  TOTAL_FRAMES,
  isTalking,
} from './timings.js';

const clampOpts = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };

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

const DebtLedgerOverlay = ({ frame }) => {
  if (frame < DEBT_LEDGER.fromFrame || frame > DEBT_LEDGER.toFrame) return null;
  const opacity = interpolate(
    frame,
    [DEBT_LEDGER.fromFrame, DEBT_LEDGER.fromFrame + 8, DEBT_LEDGER.toFrame - 8, DEBT_LEDGER.toFrame],
    [0, 1, 1, 0],
    clampOpts
  );
  return (
    <div
      style={{
        position: 'absolute',
        top: 140,
        left: 60,
        right: 180,
        opacity,
        backgroundColor: 'rgba(12, 16, 22, 0.86)',
        border: '2px solid #d8b26a',
        borderRadius: 16,
        padding: '18px 24px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ fontSize: 22, color: '#d8b26a', fontWeight: 700, letterSpacing: 1.5 }}>
        BAKI HUTANG KELAB
      </div>
      <div style={{ fontSize: 44, fontWeight: 800, marginTop: 4 }}>{DEBT_LEDGER.debt}</div>
      <div style={{ fontSize: 22, color: '#cbd5e1', marginTop: 6 }}>
        Kek Maju: {DEBT_LEDGER.kekMaju} &nbsp;|&nbsp; Kos Gaji: {DEBT_LEDGER.salaryCut}
      </div>
    </div>
  );
};

const DivisionHudOverlay = ({ frame }) => {
  if (frame < DIVISION_HUD.fromFrame || frame > DIVISION_HUD.toFrame) return null;
  const opacity = interpolate(
    frame,
    [DIVISION_HUD.fromFrame, DIVISION_HUD.fromFrame + 8, DIVISION_HUD.toFrame - 8, DIVISION_HUD.toFrame],
    [0, 1, 1, 0],
    clampOpts
  );
  return (
    <div
      style={{
        position: 'absolute',
        top: 140,
        left: 60,
        right: 180,
        opacity,
        backgroundColor: 'rgba(12, 16, 22, 0.86)',
        border: '2px solid #d8b26a',
        borderRadius: 14,
        padding: '14px 20px',
        color: '#f8fafc',
        fontFamily: 'Arial, sans-serif',
        fontSize: 24,
        fontWeight: 700,
        letterSpacing: 1,
      }}
    >
      {DIVISION_HUD.text}
    </div>
  );
};

const FixtureRevealOverlay = ({ frame }) => {
  if (frame < FIXTURE_REVEAL.fromFrame || frame >= OUTRO.fromFrame) return null;
  const opacity = interpolate(frame, [FIXTURE_REVEAL.fromFrame, FIXTURE_REVEAL.fromFrame + 10], [0, 1], clampOpts);
  return (
    <div
      style={{
        position: 'absolute',
        top: 180,
        left: 60,
        right: 180,
        opacity,
        backgroundColor: 'rgba(10, 12, 18, 0.92)',
        border: '2px solid #d8b26a',
        borderRadius: 18,
        padding: '24px 28px',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ fontSize: 24, color: '#d8b26a', fontWeight: 700, letterSpacing: 2 }}>
        {FIXTURE_REVEAL.title}
      </div>
      <div style={{ fontSize: 36, color: '#ffffff', fontWeight: 800, marginTop: 8 }}>
        {FIXTURE_REVEAL.matchup}
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
        <div
          style={{
            width: 240,
            height: 3,
            backgroundColor: '#d8b26a',
            margin: '20px auto',
          }}
        />
        <div style={{ fontSize: 34, color: '#d8b26a', letterSpacing: 4, fontWeight: 700 }}>
          {OUTRO.label}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const EPISODE_6_FRAMES = TOTAL_FRAMES;

export const Episode6Composition = () => {
  const frame = useCurrentFrame();
  const officeDuration = SCENE_1.durationFrames + SCENE_2.durationFrames;
  const pitchDuration = OUTRO.fromFrame - SCENE_3.fromFrame;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {/* Scenes 1 & 2: Episode 6 Office */}
      <Sequence from={0} durationInFrames={officeDuration}>
        <Scene3D director={createOfficeScene} />
        <CutFlash />
      </Sequence>

      {/* Scenes 3, 4 & 5: Stadium Pitch */}
      <Sequence from={SCENE_3.fromFrame} durationInFrames={pitchDuration}>
        <Scene3D director={createPitchScene} />
        <CutFlash />
      </Sequence>

      {/* HUD Overlays */}
      <SafeArea />
      <HookTitleE5 title={HOOK.title} pill={HOOK.pill} fromFrame={HOOK.fromFrame} toFrame={HOOK.toFrame} />
      <DebtLedgerOverlay frame={frame} />
      <DivisionHudOverlay frame={frame} />
      <FixtureRevealOverlay frame={frame} />

      {/* Dual Subtitles */}
      <Episode5Subtitles lines={ALL_LINES} />

      {/* Outro EndCard */}
      <Sequence from={OUTRO.fromFrame} durationInFrames={OUTRO.durationFrames}>
        <EndCard />
      </Sequence>

      {/* Audio: BGM & SFX */}
      <Audio src={staticFile('audio/bgm/tense.wav')} volume={bgmVolume} loop />
      <Sequence from={0} durationInFrames={24}>
        <Audio src={staticFile('audio/sfx/stamp.wav')} volume={0.85} />
      </Sequence>
      <Sequence from={2} durationInFrames={24}>
        <Audio src={staticFile('audio/sfx/paper.wav')} volume={0.65} />
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
