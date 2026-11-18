import React from 'react';
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { Scene3D } from '../components/Scene3D.jsx';
import { SafeArea } from '../components/SafeArea.jsx';
import { Subtitles } from '../components/Subtitles.jsx';
import { createOpeningScene } from './scenes/openingScene.js';
import { createMatchdayScene } from './scenes/matchdayScene.js';
import { createLockerRoomScene } from './scenes/lockerRoomScene.js';
import { createHandoverScene } from './scenes/handoverScene.js';
import { createCliffhangerScene } from './scenes/cliffhangerScene.js';

const SCENES = [
  {
    id: 'opening',
    from: 0,
    duration: 450,
    director: createOpeningScene,
    lines: [
      { start: 0, end: 140, text: 'Ten years of savings. Every penny I ever earned.' },
      { start: 150, end: 290, text: 'Everyone said buying a sixth-division club was financial suicide.' },
      { start: 300, end: 445, text: 'They were probably right. But this is home.', emphasis: true },
    ],
  },
  {
    id: 'matchday',
    from: 450,
    duration: 450,
    director: createMatchdayScene,
    lines: [
      { start: 10, end: 140, text: 'Sixth division. Nineteenth place. Winless in seven.' },
      { start: 150, end: 300, text: 'The pitch is falling apart.' },
      { start: 310, end: 445, text: 'And the team stopped believing weeks ago.', emphasis: true },
    ],
  },
  {
    id: 'locker-room',
    from: 900,
    duration: 540,
    director: createLockerRoomScene,
    lines: [
      {
        start: 20,
        end: 160,
        speaker: 'Owner',
        text: 'I know it has been tough. But things change starting today.',
      },
      {
        start: 180,
        end: 390,
        speaker: 'Coach',
        text: 'With respect, boss... words do not pay the electric bill. Or the lads’ wages.',
      },
      { start: 410, end: 535, text: 'Silence.' },
    ],
  },
  {
    id: 'handover',
    from: 1440,
    duration: 540,
    director: createHandoverScene,
    lines: [
      {
        start: 20,
        end: 180,
        speaker: 'Chairman',
        text: 'It’s your headache now, son. Try not to drown.',
      },
      {
        start: 220,
        end: 420,
        speaker: 'Owner',
        text: 'I will turn this club around. Whatever it takes.',
        emphasis: true,
      },
      { start: 440, end: 535, text: 'He signs.' },
    ],
  },
  {
    id: 'cliffhanger',
    from: 1980,
    duration: 420,
    director: createCliffhangerScene,
    lines: [
      { start: 15, end: 150, text: 'Hidden private loan clause: £450,000 overdue.' },
      {
        start: 170,
        end: 310,
        text: 'Full payment due in 30 days — or the ground is seized and demolished.',
      },
      { start: 320, end: 415, text: 'My life savings only bought the debt.', emphasis: true },
    ],
  },
];

const EndCard = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 14, 104, 120],
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
          EPISODE 1
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
      </Sequence>
    ))}
    <Sequence from={2400} durationInFrames={120}>
      <EndCard />
    </Sequence>
  </AbsoluteFill>
);
