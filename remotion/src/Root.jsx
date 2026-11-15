import React from 'react';
import { Composition } from 'remotion';
import { FootballMatch } from './FootballMatch.jsx';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="FootballMatch"
        component={FootballMatch}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
