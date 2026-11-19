import React from 'react';
import { Composition } from 'remotion';
import { FootballMatch } from './FootballMatch.jsx';
import { Episode1Composition } from './Episode1/Episode1Composition.jsx';
import { Episode2Composition } from './Episode2/Episode2Composition.jsx';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="FootballMatch"
        component={FootballMatch}
        durationInFrames={300}
        fps={30}
        width={720}
        height={1280}
      />
      <Composition
        id="Episode1"
        component={Episode1Composition}
        durationInFrames={2245}
        fps={30}
        width={720}
        height={1280}
      />
      <Composition
        id="Episode2"
        component={Episode2Composition}
        durationInFrames={1260}
        fps={30}
        width={720}
        height={1280}
      />
    </>
  );
};
