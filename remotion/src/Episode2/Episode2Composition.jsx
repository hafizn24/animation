import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, interpolate, useCurrentFrame } from 'remotion';
import { Scene3D } from '../components/Scene3D.jsx';
import { SafeArea } from '../components/SafeArea.jsx';
import { Subtitles } from '../components/Subtitles.jsx';
import { createSponsorPitchScene } from './scenes/sponsorPitchScene.js';
import { createSponsorRejectScene } from './scenes/sponsorRejectScene.js';
import { createOfficePlanScene } from './scenes/officePlanScene.js';
import { createStadiumSetupScene } from './scenes/stadiumSetupScene.js';
import { createFriendlyMatchScene } from './scenes/friendlyMatchScene.js';
import { createLockerAfterScene } from './scenes/lockerAfterScene.js';
import { createTrainingHookScene } from './scenes/trainingHookScene.js';

const SCENES = [
  {
    id: 'cold-open',
    from: 0,
    duration: 300,
    director: createSponsorPitchScene,
    narrator: 'Hari kedua puluh tujuh. Bilik kaca, kopi panas. Pemilik datang dengan satu fail.',
    audio: ['e2_b1_narrator.mp3', 'e2_b1_penaja.mp3'],
    audioAt: [0, 150],
    lines: [
      {
        start: 150,
        end: 298,
        speaker: 'Penaaja',
        text: 'Divisyen 5? Maaf, bos. Kami tak nak letak logo pada kelab yang orang tak kenal.',
        emphasis: true,
      },
      { start: 200, end: 298, text: 'Hari ke-27. Duit makin sikit.' },
    ],
  },
  {
    id: 'second-pitch',
    from: 300,
    duration: 200,
    director: createSponsorRejectScene,
    narrator: 'Dia cuba lagi. Satu lagi meja. Satu lagi "tak ada bajet".',
    audio: ['e2_b2_narrator.mp3', 'e2_b2_penaja.mp3'],
    audioAt: [0, 110],
    lines: [
      {
        start: 110,
        end: 198,
        speaker: 'Penaaja',
        text: 'Bila stadium penuh baru kita borak. Jumpa lagi nanti.',
      },
    ],
  },
  {
    id: 'office-plan',
    from: 500,
    duration: 330,
    director: createOfficePlanScene,
    narrator: 'Petang itu, di bilik kerja yang sama, satu idea lahir dari keputusasaan.',
    audio: ['e2_b3_narrator.mp3', 'e2_b3_pemilik.mp3', 'e2_b3_jurulatih.mp3'],
    audioAt: [0, 130, 255],
    lines: [
      {
        start: 130,
        end: 245,
        speaker: 'Pemilik',
        text: 'Kita buat perlawanan persahabatan. Jual tiket, bawa orang datang.',
      },
      {
        start: 255,
        end: 328,
        speaker: 'Jurulatih',
        text: 'Dengan duit apa? Kita tak ada bola pun.',
      },
    ],
  },
  {
    id: 'stadium-setup',
    from: 830,
    duration: 250,
    director: createStadiumSetupScene,
    narrator: 'Esoknya, padang kosong mula hidup. Kain rentang, meja tiket.',
    audio: ['e2_b4_narrator.mp3', 'e2_b4_pemilik.mp3'],
    audioAt: [0, 115],
    lines: [
      {
        start: 115,
        end: 248,
        speaker: 'Pemilik',
        text: 'Mulai hari ini, kita tak main untuk menang. Kita main untuk nyawa kelab ni.',
        emphasis: true,
      },
    ],
  },
  {
    id: 'friendly-match',
    from: 1080,
    duration: 210,
    director: createFriendlyMatchScene,
    narrator: 'Malamnya, lampu stadium menyala. Kali ni ada sorakan. Ada yang bayar.',
    audio: ['e2_b5_narrator.mp3', 'e2_b5_pemilik.mp3'],
    audioAt: [0, 105],
    lines: [
      { start: 105, end: 165, speaker: 'Pemilik', text: 'Satu gol! Kita masih bernafas!', emphasis: true },
      { start: 170, end: 208, text: 'Tapi satu gol tak cukup bayar RM450,000.' },
    ],
  },
  {
    id: 'locker-after',
    from: 1290,
    duration: 320,
    director: createLockerAfterScene,
    narrator: 'Selepas wisel, bilik ganti penuh peluh... dan senyuman pertama dalam seminggu.',
    audio: ['e2_b6_narrator.mp3', 'e2_b6_pemilik.mp3', 'e2_b6_jurulatih.mp3'],
    audioAt: [0, 130, 250],
    lines: [
      {
        start: 130,
        end: 240,
        speaker: 'Pemilik',
        text: 'Lima belas ribu. Kita perlukan empat ratus lima puluh ribu lebih.',
      },
      {
        start: 250,
        end: 318,
        speaker: 'Jurulatih',
        text: 'Semangat tu tak cukup bayar gaji, bos.',
      },
    ],
  },
  {
    id: 'training-hook',
    from: 1610,
    duration: 190,
    director: createTrainingHookScene,
    narrator: 'Dia tak cakap pasal duit lagi.',
    audio: ['e2_b7_narrator.mp3', 'e2_b7_pemilik.mp3'],
    audioAt: [0, 55],
    lines: [
      {
        start: 55,
        end: 188,
        speaker: 'Pemilik',
        text: 'Esok, jam lima pagi. Kita ke hutan. Kita lari sampai percaya semula.',
        emphasis: true,
      },
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

const ScoreBug = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [70, 82, 195, 208],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            background: 'rgba(5, 9, 18, 0.9)',
            border: '2px solid #d8b26a',
            borderRadius: 8,
            padding: '10px 22px',
            boxShadow: '0 8px 28px rgba(0,0,0,0.65)',
          }}
        >
          <span style={{ color: '#f7f4ea', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 21, fontWeight: 'bold', letterSpacing: 2 }}>
            BULUH
          </span>
          <span style={{ color: '#d8b26a', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 38, fontWeight: 'bold' }}>
            1 - 0
          </span>
          <span style={{ color: '#f7f4ea', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 21, fontWeight: 'bold', letterSpacing: 2 }}>
            GUEST
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CTAOverlay = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [120, 134, 182, 190],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const scale = interpolate(frame, [120, 134], [0.9, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: 130, pointerEvents: 'none' }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          textAlign: 'center',
          background: 'rgba(5, 9, 18, 0.88)',
          border: '2px solid #d8b26a',
          borderRadius: 10,
          padding: '14px 26px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.7)',
        }}
      >
        <div
          style={{
            color: '#d8b26a',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 15,
            fontWeight: 'bold',
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          Nak tengok latihan?
        </div>
        <div
          style={{
            color: '#f7f4ea',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 32,
            fontWeight: 'bold',
            marginTop: 6,
          }}
        >
          Komen 'EPISOD 3'
        </div>
      </div>
    </AbsoluteFill>
  );
};

const EndCard = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 8, 76, 90],
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
          EPISOD 2
        </div>
        <div
          style={{
            margin: '26px auto 0',
            width: 110,
            height: 3,
            backgroundColor: '#d8b26a',
          }}
        />
        <div
          style={{
            color: '#f7f4ea',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 26,
            fontWeight: 'bold',
            letterSpacing: 1,
            marginTop: 24,
          }}
        >
          Komen 'EPISOD 3'
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Episode2Composition = () => (
  <AbsoluteFill style={{ backgroundColor: '#05070d' }}>
    {SCENES.map((scene) => (
      <Sequence key={scene.id} from={scene.from} durationInFrames={scene.duration}>
        <Scene3D director={scene.director} />
        <SafeArea />
        <Subtitles lines={scene.lines} narrator={scene.narrator} />
        {scene.id === 'friendly-match' ? <ScoreBug /> : null}
        {scene.id === 'training-hook' ? <CTAOverlay /> : null}
        <CutFlash />
        {scene.audio.map((file, index) => (
          <Sequence key={file} from={scene.audioAt[index]}>
            <Audio src={staticFile(`audio/tts/${file}`)} volume={1} />
          </Sequence>
        ))}
      </Sequence>
    ))}
    <Sequence from={1800} durationInFrames={90}>
      <EndCard />
    </Sequence>
  </AbsoluteFill>
);
