import React from 'react';
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { Scene3D } from '../components/Scene3D.jsx';
import { SafeArea } from '../components/SafeArea.jsx';
import { Subtitles } from '../components/Subtitles.jsx';
import { createBoardroomScene } from './scenes/boardroomScene.js';
import { createMatchdayScene } from './scenes/matchdayScene.js';
import { createTunnelScene } from './scenes/tunnelScene.js';
import { createLockerRoomScene } from './scenes/lockerRoomScene.js';
import { createHandoverScene } from './scenes/handoverScene.js';
import { createCliffhangerScene } from './scenes/cliffhangerScene.js';

const SCENES = [
  {
    id: 'cold-open',
    from: 0,
    duration: 240,
    director: createBoardroomScene,
    lines: [
      { start: 6, end: 100, text: '£450,000 tertunggak.', emphasis: true },
      { start: 110, end: 235, text: 'Tiga puluh hari. Atau stadium ini milik kami.' },
    ],
  },
  {
    id: 'matchday',
    from: 240,
    duration: 180,
    director: createMatchdayScene,
    lines: [
      { start: 8, end: 80, text: 'Divisyen keenam. Tempat kesembilan belas.' },
      { start: 90, end: 175, text: '0 - 3. Dan pasukan ini sudah berputus asa.', emphasis: true },
    ],
  },
  {
    id: 'tunnel',
    from: 420,
    duration: 240,
    director: createTunnelScene,
    lines: [
      { start: 5, end: 80, text: 'Sepuluh tahun simpanan. Setiap sen yang saya hasilkan.' },
      { start: 90, end: 170, text: 'Semua orang kata ini bunuh diri kewangan.' },
      { start: 180, end: 235, text: 'Tapi inilah rumah saya.', emphasis: true },
    ],
  },
  {
    id: 'locker-room',
    from: 660,
    duration: 360,
    director: createLockerRoomScene,
    lines: [
      {
        start: 10,
        end: 120,
        speaker: 'Pemilik',
        text: 'Saya tahu ini berat. Tapi semuanya berubah hari ini.',
      },
      {
        start: 135,
        end: 290,
        speaker: 'Jurulatih',
        text: 'Dengan segala hormatnya, bos... kata-kata tak bayar bil elektrik. Atau gaji budak-budak ini.',
      },
      { start: 305, end: 355, text: 'Sunyi.' },
    ],
  },
  {
    id: 'handover',
    from: 1020,
    duration: 360,
    director: createHandoverScene,
    lines: [
      {
        start: 10,
        end: 130,
        speaker: 'Pengerusi',
        text: 'Sekarang ini masalah awak, anak muda. Jangan sampai tenggelam.',
      },
      {
        start: 150,
        end: 290,
        speaker: 'Pemilik',
        text: 'Saya akan bangunkan semula kelab ini. Apa pun jadinya.',
        emphasis: true,
      },
      { start: 310, end: 355, text: 'Dia menandatangani.' },
    ],
  },
  {
    id: 'cliffhanger',
    from: 1380,
    duration: 300,
    director: createCliffhangerScene,
    lines: [
      { start: 10, end: 110, text: 'Klausul pinjaman persendirian tersembunyi: £450,000 tertunggak.' },
      { start: 125, end: 230, text: 'Bayaran penuh dalam 30 hari — atau stadium ini dirampas.' },
      { start: 245, end: 295, text: 'Wang simpanan saya hanya membeli hutangnya.', emphasis: true },
    ],
  },
  {
    id: 'final-hook',
    from: 1680,
    duration: 180,
    director: createBoardroomScene,
    lines: [
      { start: 15, end: 85, speaker: 'Peguam', text: 'Tiga puluh hari.' },
      { start: 100, end: 175, text: 'Hari pertama bermula sekarang.', emphasis: true },
    ],
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

const EndCard = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 10, 108, 120],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#05070d', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ opacity, textAlign: 'center' }}>
        <div
          style={{
            color: '#d8b26a',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 22,
            letterSpacing: 12,
            textTransform: 'uppercase',
          }}
        >
          Buluh FC
        </div>
        <div
          style={{
            color: '#f7f4ea',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 64,
            fontWeight: 'bold',
            letterSpacing: 4,
            marginTop: 14,
          }}
        >
          EPISOD 1
        </div>
        <div
          style={{
            margin: '26px auto 0',
            width: 110,
            height: 3,
            backgroundColor: '#d8b26a',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const Episode1Composition = () => (
  <AbsoluteFill style={{ backgroundColor: '#05070d' }}>
    {SCENES.map((scene) => (
      <Sequence key={scene.id} from={scene.from} durationInFrames={scene.duration}>
        <Scene3D director={scene.director} />
        <SafeArea />
        <Subtitles lines={scene.lines} />
        <CutFlash />
      </Sequence>
    ))}
    <Sequence from={1860} durationInFrames={120}>
      <EndCard />
    </Sequence>
  </AbsoluteFill>
);
