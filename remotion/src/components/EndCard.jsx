import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

const GOLD = '#d8b26a';
const clampOpts = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };

/** Standard 72-frame black Buluh FC / EPISOD X card. No CTA, no credits crawl. */
export const EndCard = ({ episode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, 30, 66, 72], [1, 1, 1, 0], clampOpts);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ opacity, textAlign: 'center' }}>
        <div
          style={{
            color: '#f7f4ea',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 99,
            fontWeight: 'bold',
            letterSpacing: 9,
          }}
        >
          Buluh FC
        </div>
        <div style={{ margin: '36px auto', width: 255, height: 3, backgroundColor: GOLD }} />
        <div
          style={{
            color: GOLD,
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 39,
            letterSpacing: 18,
            textTransform: 'uppercase',
          }}
        >
          EPISOD {episode}
        </div>
      </div>
    </AbsoluteFill>
  );
};
