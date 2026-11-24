import React from 'react';
import { Composition } from 'remotion';
import { FootballMatch } from './FootballMatch.jsx';
import { Episode1Composition } from './Episode1/Episode1Composition.jsx';
import { Episode2Composition } from './Episode2/Episode2Composition.jsx';
import { Episode3Composition } from './Episode3/Episode3Composition.jsx';
import { Episode4Composition } from './Episode4/Episode4Composition.jsx';
import { Episode5Composition, EPISODE_5_FRAMES } from './Episode5/Episode5Composition.jsx';
import { Episode6Composition, EPISODE_6_FRAMES } from './Episode6/Episode6Composition.jsx';
import { Episode7Composition, EPISODE_7_FRAMES } from './Episode7/Episode7Composition.jsx';
import { Episode8Composition, EPISODE_8_FRAMES } from './Episode8/Episode8Composition.jsx';
import { Episode9Composition, EPISODE_9_FRAMES } from './Episode9/Episode9Composition.jsx';
import { Episode10Composition, EPISODE_10_FRAMES } from './Episode10/Episode10Composition.jsx';
import { Episode11Composition, EPISODE_11_FRAMES } from './Episode11/Episode11Composition.jsx';
import { Episode12Composition, EPISODE_12_FRAMES } from './Episode12/Episode12Composition.jsx';

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
      <Composition id="Episode6" component={Episode6Composition} durationInFrames={EPISODE_6_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="Episode7" component={Episode7Composition} durationInFrames={EPISODE_7_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="Episode8" component={Episode8Composition} durationInFrames={EPISODE_8_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="Episode9" component={Episode9Composition} durationInFrames={EPISODE_9_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="Episode10" component={Episode10Composition} durationInFrames={EPISODE_10_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="Episode11" component={Episode11Composition} durationInFrames={EPISODE_11_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="Episode12" component={Episode12Composition} durationInFrames={EPISODE_12_FRAMES} fps={30} width={1080} height={1920} />
    </>
  );
};
