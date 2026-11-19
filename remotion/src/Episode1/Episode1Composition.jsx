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
    narrator: "Malam ni, dalam bilik kerja yang sejuk, satu folder merah kena ketuk atas meja. Nampak macam biasa... tapi ada yang nak berakhir.",
    lines: [
      { start: 85, end: 150, text: 'RM450,000 tertunggak.', emphasis: true },
      { start: 155, end: 235, text: 'Tiga puluh hari. Atau stadium ini milik kami.' },
    ],
  },
  {
    id: 'matchday',
    from: 240,
    duration: 180,
    director: createMatchdayScene,
    narrator: "Padang dah gelap, tapi lampu stadium masih terang. Buluh FC... kelab yang dulu pernah ada harapan.",
    lines: [
      { start: 85, end: 130, text: 'Peringkat rendah kita. Tempat kebelakangan.' },
      { start: 135, end: 175, text: '0 - 3. Dan pasukan ni dah berputus asa.', emphasis: true },
    ],
  },
  {
    id: 'tunnel',
    from: 420,
    duration: 240,
    director: createTunnelScene,
    narrator: "Dia jalan dari gelap ke terang. Sepuluh tahun duit simpanan, orang kata ni bunuh diri... tapi dia tak peduli.",
    lines: [
      { start: 85, end: 235, text: 'Tapi ni rumah saya.', emphasis: true },
    ],
  },
  {
    id: 'locker-room',
    from: 660,
    duration: 360,
    director: createLockerRoomScene,
    narrator: "Bilik ganti sunyi, lampu berkelip. Dia masuk, dan terus rasa tekanan tu.",
    lines: [
      {
        start: 85,
        end: 165,
        speaker: 'Pemilik',
        text: 'Saya tahu ni berat. Tapi semuanya berubah hari ini.',
      },
      {
        start: 170,
        end: 280,
        speaker: 'Jurulatih',
        text: 'Maaf bos, tapi kata-kata tak bagi pampasan untuk bayar bil elektrik. Atau gaji pemain.',
      },
      { start: 285, end: 355, text: 'Sunyi menerpa ruang.' },
    ],
  },
  {
    id: 'handover',
    from: 1020,
    duration: 360,
    director: createHandoverScene,
    narrator: "Meja kayu, lampu meja, sepasang kunci. Pengerusi tak banyak cakap — tapi dia tahu beban yang dia serahkan.",
    lines: [
      {
        start: 85,
        end: 175,
        speaker: 'Pengerusi',
        text: 'Sekarang ni masalah awak, anak muda. Jangan sampai tenggelam.',
      },
      {
        start: 180,
        end: 290,
        speaker: 'Pemilik',
        text: 'Saya akan cuba bina semula kelab ni. Apa pun jadinya.',
        emphasis: true,
      },
      { start: 295, end: 355, text: 'Dia menandatangani.' },
    ],
  },
  {
    id: 'cliffhanger',
    from: 1380,
    duration: 300,
    director: createCliffhangerScene,
    narrator: "Bilik dah gelap. Satu dokumen dengan cop merah muncul — klausul yang tersorok daripada dia sejak awal.",
    lines: [
      { start: 85, end: 180, text: 'Bayaran penuh dalam 30 hari — atau stadium ni dirampas.' },
      { start: 185, end: 295, text: 'Wang simpanan saya hanya beli hutangnya.', emphasis: true },
    ],
  },
  {
    id: 'final-hook',
    from: 1680,
    duration: 180,
    director: createBoardroomScene,
    narrator: "Bilik kerja yang sama. Folder ditutup perlahan. Satu perkiraan dah bermula.",
    lines: [
      { start: 85, end: 125, speaker: 'Peguam', text: 'Tiga puluh hari.' },
      { start: 130, end: 175, text: 'Hari pertama bermula sekarang.', emphasis: true },
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
        <Subtitles lines={scene.lines} narrator={scene.narrator} />
        <CutFlash />
      </Sequence>
    ))}
    <Sequence from={1860} durationInFrames={120}>
      <EndCard />
    </Sequence>
  </AbsoluteFill>
);
