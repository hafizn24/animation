import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, interpolate, useCurrentFrame } from 'remotion';
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
    duration: 340,
    director: createBoardroomScene,
    narrator: "Malam ni, dalam bilik kerja yang sejuk, satu folder merah kena ketuk atas meja. Nampak macam biasa... tapi ada yang nak berakhir.",
    audio: ['b1_narrator.mp3', 'b1_peguam.mp3'],
    audioAt: [0, 196],
    lines: [
      { start: 196, end: 260, text: 'RM450,000 tertunggak.', emphasis: true },
      { start: 265, end: 335, text: 'Tiga puluh hari. Atau stadium ini milik kami.' },
    ],
  },
  {
    id: 'matchday',
    from: 340,
    duration: 240,
    director: createMatchdayScene,
    narrator: "Padang dah gelap, tapi lampu stadium masih terang. Buluh FC... kelab yang dulu pernah ada harapan.",
    audio: ['b2_narrator.mp3'],
    audioAt: [0],
    lines: [
      { start: 85, end: 130, text: 'Peringkat rendah kita. Tempat kebelakangan.' },
      { start: 135, end: 175, text: '0 - 3. Dan pasukan ni dah berputus asa.', emphasis: true },
    ],
  },
  {
    id: 'tunnel',
    from: 580,
    duration: 240,
    director: createTunnelScene,
    narrator: "Dia jalan dari gelap ke terang. Sepuluh tahun duit simpanan, orang kata ni kerja gila... tapi dia tak peduli.",
    audio: ['b3_narrator.mp3', 'b3_pemilik.mp3'],
    audioAt: [0, 169],
    lines: [
      { start: 169, end: 235, text: 'Tapi ni rumah saya.', emphasis: true },
    ],
  },
  {
    id: 'locker-room',
    from: 820,
    duration: 400,
    director: createLockerRoomScene,
    narrator: "Bilik ganti sunyi, lampu berkelip. Dia masuk, dan terus rasa tekanan tu.",
    audio: ['b4_narrator.mp3', 'b4_pemilik.mp3', 'b4_jurulatih.mp3'],
    audioAt: [0, 125, 213],
    lines: [
      {
        start: 125,
        end: 205,
        speaker: 'Pemilik',
        text: 'Saya tahu ni berat. Tapi semuanya berubah hari ini.',
      },
      {
        start: 213,
        end: 365,
        speaker: 'Jurulatih',
        text: 'Maaf bos, tapi kata-kata tak bagi pampasan untuk bayar bil elektrik. Atau gaji pemain.',
      },
      { start: 370, end: 395, text: 'Sunyi menerpa ruang.' },
    ],
  },
  {
    id: 'handover',
    from: 1220,
    duration: 390,
    director: createHandoverScene,
    narrator: "Meja kayu, lampu meja, sepasang kunci. Pengerusi tak banyak cakap — tapi dia tahu beban yang dia serahkan.",
    audio: ['b5_narrator.mp3', 'b5_pengerusi.mp3', 'b5_pemilik.mp3'],
    audioAt: [0, 158, 258],
    lines: [
      {
        start: 158,
        end: 250,
        speaker: 'Pengerusi',
        text: 'Sekarang ni masalah awak, anak muda. Jangan sampai tenggelam.',
      },
      {
        start: 258,
        end: 345,
        speaker: 'Pemilik',
        text: 'Saya akan cuba bina semula kelab ni. Apa pun jadinya.',
        emphasis: true,
      },
      { start: 352, end: 385, text: 'Dia menandatangani.' },
    ],
  },
  {
    id: 'cliffhanger',
    from: 1610,
    duration: 300,
    director: createCliffhangerScene,
    narrator: "Bilik dah gelap. Satu dokumen dengan cop merah muncul — klausul yang tersorok daripada dia sejak awal.",
    audio: ['b6_narrator.mp3', 'b6_pemilik.mp3'],
    audioAt: [0, 155],
    lines: [
      { start: 85, end: 145, text: 'Bayaran penuh dalam 30 hari — atau stadium ni dirampas.' },
      { start: 155, end: 225, text: 'Wang simpanan saya hanya beli hutangnya.', emphasis: true },
    ],
  },
  {
    id: 'final-hook',
    from: 1910,
    duration: 215,
    director: createBoardroomScene,
    narrator: "Bilik kerja yang sama. Folder ditutup perlahan. Satu perkiraan dah bermula.",
    audio: ['b7_narrator.mp3', 'b7_peguam.mp3'],
    audioAt: [0, 128],
    lines: [
      { start: 128, end: 165, speaker: 'Peguam', text: 'Tiga puluh hari.' },
      { start: 170, end: 210, text: 'Hari pertama bermula sekarang.', emphasis: true },
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
        {scene.audio.map((file, index) => (
          <Sequence key={file} from={scene.audioAt[index]}>
            <Audio src={staticFile(`audio/tts/${file}`)} volume={1} />
          </Sequence>
        ))}
      </Sequence>
    ))}
    <Sequence from={2125} durationInFrames={120}>
      <EndCard />
    </Sequence>
  </AbsoluteFill>
);
