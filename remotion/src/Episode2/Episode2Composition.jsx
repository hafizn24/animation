import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Scene3D } from '../components/Scene3D.jsx';
import { SafeArea } from '../components/SafeArea.jsx';
import { createRecapScene } from './scenes/recapScene.js';
import { createSponsorRejectMontageScene } from './scenes/sponsorRejectMontageScene.js';
import { createBakerySponsorScene } from './scenes/bakerySponsorScene.js';
import { createOfficePlanScene } from './scenes/officePlanScene.js';

const SCENES = [
  {
    id: 'recap',
    from: 0,
    duration: 150,
    director: createRecapScene,
    audio: ['e2_b1_narrator.mp3'],
    audioAt: [0],
  },
  {
    id: 'sponsor-montage',
    from: 150,
    duration: 480,
    director: createSponsorRejectMontageScene,
    audio: ['e2_b2_narrator.mp3'],
    audioAt: [0],
  },
  {
    id: 'bakery-sponsor',
    from: 630,
    duration: 420,
    director: createBakerySponsorScene,
    audio: ['e2_b3_narrator.mp3'],
    audioAt: [0],
  },
  {
    id: 'crowdfunding-plan',
    from: 1050,
    duration: 450,
    director: createOfficePlanScene,
    audio: ['e2_b4_cta.mp3'],
    audioAt: [0],
  },
];

const CutFlash = () => {
  const frame = useCurrentFrame();
  if (frame >= 2) return null;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: `rgba(255,255,255,${0.3 * (1 - frame / 2)})`,
        pointerEvents: 'none',
      }}
    />
  );
};

export const Episode2Composition = () => (
  <AbsoluteFill style={{ backgroundColor: '#05070d' }}>
    {SCENES.map((scene) => (
      <Sequence key={scene.id} from={scene.from} durationInFrames={scene.duration}>
        <Scene3D director={scene.director} />
        <SafeArea />
        <CutFlash />
        {scene.audio.map((file, index) => (
          <Sequence key={file} from={scene.audioAt[index]}>
            <Audio src={staticFile(`audio/tts/${file}`)} volume={1} />
          </Sequence>
        ))}
      </Sequence>
    ))}
  </AbsoluteFill>
);
