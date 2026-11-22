import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, interpolate, useCurrentFrame } from 'remotion';
import { Scene3D } from '../components/Scene3D.jsx';
import { SafeArea } from '../components/SafeArea.jsx';
import { Subtitles } from '../components/Subtitles.jsx';
import { createDefaultNoticeScene } from './scenes/defaultNoticeScene.js';
import { createNexusRejectScene } from './scenes/nexusRejectScene.js';
import { createApexRejectScene } from './scenes/apexRejectScene.js';
import { createClosingDoorScene } from './scenes/closingDoorScene.js';
import { createBakeryScene } from './scenes/bakeryScene.js';
import { createOfficeEndingScene } from './scenes/officeEndingScene.js';

/**
 * Episode 2 — 42s / 1260 frames @ 30fps.
 * Timings and copy mirror episodes/episode-2/audio-script.json.
 * Every line is timed; narration uses the gold italic serif style and spoken
 * lines use white sans-serif with an uppercase gold speaker label.
 */
const SCENES = [
  {
    id: 'default-notice',
    from: 0,
    duration: 120,
    director: createDefaultNoticeScene,
    lines: [
      {
        start: 15,
        end: 120,
        narration: true,
        text: 'Hutang empat ratus lima puluh ribu ringgit. Masa makin suntuk.',
      },
    ],
    audio: [['e2_s1_narrator.mp3', 15]],
    sfx: [['stamp.wav', 0]],
  },
  {
    id: 'sponsor-nexus',
    from: 135,
    duration: 195,
    director: createNexusRejectScene,
    lines: [
      {
        start: 0,
        end: 90,
        narration: true,
        text: 'Satu demi satu penaja besar dia ketuk... tapi semua tutup pintu.',
      },
      {
        start: 99,
        end: 189,
        speaker: 'PENAJA 1',
        text: 'Divisyen lima? Maaf lah bro, memang tak berbaloi.',
      },
    ],
    audio: [
      ['e2_s2_narrator.mp3', 0],
      ['e2_s2_penaja1.mp3', 99],
    ],
  },
  {
    id: 'sponsor-apex',
    from: 336,
    duration: 108,
    director: createApexRejectScene,
    lines: [
      {
        start: 0,
        end: 99,
        speaker: 'PENAJA 2',
        text: 'Kalau kelab besar, boleh la cerita. Ini risiko tinggi sangat.',
      },
    ],
    audio: [['e2_s3_penaja2.mp3', 0]],
    sfx: [['paper.wav', 30]],
  },
  {
    id: 'closing-door',
    from: 450,
    duration: 90,
    director: createClosingDoorScene,
    blackout: true,
    lines: [
      {
        start: 0,
        end: 84,
        narration: true,
        text: 'Semua pintu tertutup. Tinggal harapan kosong je.',
      },
    ],
    audio: [['e2_s4_narrator.mp3', 0]],
    sfx: [['door.wav', 75]],
  },
  {
    id: 'kek-maju-bakery',
    from: 540,
    duration: 360,
    director: createBakeryScene,
    lines: [
      {
        start: 15,
        end: 114,
        narration: true,
        text: 'Sampai la dia singgah kat satu kedai kek kecil ni... Kek Maju.',
      },
      {
        start: 126,
        end: 264,
        speaker: 'KEK MAJU',
        text: 'Akak bukan orang kaya, tapi akak sayang kelab kita ni. Ambik la sikit ni, buat modal dulu.',
      },
      {
        start: 276,
        end: 366,
        speaker: 'PEMILIK',
        text: 'Terima kasih banyak, kak. Kami memang takkan lupa jasa akak.',
      },
    ],
    audio: [
      ['e2_s5_narrator.mp3', 15],
      ['e2_s5_kekmaju.mp3', 126],
      ['e2_s5_pemilik.mp3', 276],
    ],
    sfx: [['bell.wav', 12]],
  },
  {
    id: 'club-office-ending',
    from: 900,
    duration: 288,
    director: createOfficeEndingScene,
    lines: [
      {
        start: 24,
        end: 156,
        speaker: 'JURULATIH',
        text: 'Kalau macam tu, kita buat perlawanan amal. Biar satu pekan tahu Buluh FC belum mati.',
      },
      {
        start: 168,
        end: 276,
        speaker: 'PEMILIK',
        text: 'Betul. Ini peluang terakhir kita. Kalau kalah, semua habis.',
      },
    ],
    audio: [
      ['e2_s6_jurulatih.mp3', 24],
      ['e2_s6_pemilik.mp3', 168],
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

const DoorBlackout = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [76, 88], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{ backgroundColor: '#000', opacity, pointerEvents: 'none' }} />
  );
};

const EndCard = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 6, 60, 72], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

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
        <div
          style={{
            margin: '24px auto',
            width: 170,
            height: 2,
            backgroundColor: '#d8b26a',
          }}
        />
        <div
          style={{
            color: '#d8b26a',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 26,
            letterSpacing: 12,
            textTransform: 'uppercase',
          }}
        >
          EPISOD 2
        </div>
      </div>
    </AbsoluteFill>
  );
};

const tenseVolume = (frame) => {
  if (frame < 0 || frame > 560) return 0;
  const fadeIn = interpolate(frame, [0, 20], [0, 0.18], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(frame, [500, 560], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return Math.min(fadeIn, 0.18 * fadeOut);
};

const warmVolume = (frame) => {
  if (frame < 540 || frame > 1188) return 0;
  const fadeIn = interpolate(frame, [540, 610], [0, 0.16], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(frame, [1110, 1188], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return Math.min(fadeIn, 0.16 * fadeOut);
};

export const Episode2Composition = () => (
  <AbsoluteFill style={{ backgroundColor: '#05070d' }}>
    <Audio src={staticFile('audio/bgm/tense.wav')} volume={tenseVolume} />
    <Audio src={staticFile('audio/bgm/warm.wav')} volume={warmVolume} />
    {SCENES.map((scene) => (
      <Sequence key={scene.id} from={scene.from} durationInFrames={scene.duration}>
        <Scene3D director={scene.director} />
        <SafeArea />
        <Subtitles lines={scene.lines} />
        <CutFlash />
        {scene.blackout ? <DoorBlackout /> : null}
        {scene.audio.map(([file, at]) => (
          <Sequence key={file} from={at}>
            <Audio src={staticFile(`audio/tts/${file}`)} volume={1} />
          </Sequence>
        ))}
        {(scene.sfx || []).map(([file, at]) => (
          <Sequence key={file} from={at}>
            <Audio src={staticFile(`audio/sfx/${file}`)} volume={0.7} />
          </Sequence>
        ))}
      </Sequence>
    ))}
    <Sequence from={1188} durationInFrames={72}>
      <EndCard />
    </Sequence>
  </AbsoluteFill>
);
