import React from 'react';
import { Composition } from 'remotion';
import { FootballMatch } from './FootballMatch.jsx';
import { Episode1Composition } from './Episode1/Episode1Composition.jsx';
import { Episode2Composition } from './Episode2/Episode2Composition.jsx';
import { Episode3Composition } from './Episode3/Episode3Composition.jsx';
import { Episode4Composition } from './Episode4/Episode4Composition.jsx';
import { Episode5Composition, EPISODE_5_FRAMES } from './Episode5/Episode5Composition.jsx';

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
      <Composition
        id="Episode3"
        component={Episode3Composition}
        durationInFrames={1260}
        fps={30}
        width={720}
        height={1280}
      />
      <Composition
        id="Episode4"
        component={Episode4Composition}
        durationInFrames={1530}
        fps={30}
        width={720}
        height={1280}
      />
      <Composition
        id="Episode5"
        component={Episode5Composition}
        durationInFrames={EPISODE_5_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
