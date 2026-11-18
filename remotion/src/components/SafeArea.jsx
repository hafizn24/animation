import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';

export const SafeArea = () => {
  const { height } = useVideoConfig();
  const top = Math.round(height * 0.1);
  const bottom = Math.round(height * 0.17);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: top,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: bottom,
          background: 'linear-gradient(0deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.35) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
