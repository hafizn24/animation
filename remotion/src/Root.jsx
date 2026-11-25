import React from 'react';
import { Composition } from 'remotion';
import { EPISODES } from './episodes.js';

export const RemotionRoot = () => (
  <>
    {EPISODES.map(({ id, component, frames, width, height }) => (
      <Composition
        key={id}
        id={id}
        component={component}
        durationInFrames={frames}
        fps={30}
        width={width}
        height={height}
      />
    ))}
  </>
);
