import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
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
  },
  {
    id: 'sponsor-montage',
    from: 150,
    duration: 480,
    director: createSponsorRejectMontageScene,
  },
  {
    id: 'bakery-sponsor',
    from: 630,
    duration: 420,
    director: createBakerySponsorScene,
  },
  {
    id: 'crowdfunding-plan',
    from: 1050,
    duration: 450,
    director: createOfficePlanScene,
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
      </Sequence>
    ))}
  </AbsoluteFill>
);
