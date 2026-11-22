import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const GOLD = '#d8b26a';
const clampOpts = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };

/** Snappy 0.8s "ESOKNYA..." time-jump card over the start of Act 2. */
export const TransitionTitleCard = ({ config, sceneFrom = 0 }) => {
  const frame = useCurrentFrame() + sceneFrom;
  const { fps, height } = useVideoConfig();
  const { fromFrame, toFrame, text } = config;

  if (frame < fromFrame || frame > toFrame) return null;

  const local = frame - fromFrame;
  const span = toFrame - fromFrame;
  const pop = spring({ frame: local, fps, config: { damping: 11, stiffness: 240, mass: 0.55 } });
  const scale = interpolate(pop, [0, 1], [1.35, 1], clampOpts);
  const opacity = Math.min(
    interpolate(local, [0, 3], [0, 1], clampOpts),
    interpolate(local, [span - 8, span], [1, 0], clampOpts)
  );
  const slide = interpolate(local, [0, span], [-24, 18], clampOpts);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: Math.round(height * 0.36),
          left: 0,
          right: 0,
          opacity,
          transform: `translateY(${slide}px) scale(${scale})`,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            color: '#0c1016',
            background: GOLD,
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 18,
            fontWeight: 'bold',
            letterSpacing: 4,
            padding: '8px 18px',
            borderRadius: 4,
            marginBottom: 14,
          }}
        >
          SATU HARI KEMUDIAN
        </div>
        <div
          style={{
            color: '#fff8e8',
            fontFamily: 'Arial Black, Arial, Helvetica, sans-serif',
            fontSize: 84,
            lineHeight: 1,
            letterSpacing: 4,
            textTransform: 'uppercase',
            textShadow: '0 5px 0 #7a1c12, 0 10px 0 rgba(0,0,0,0.6), 0 0 34px rgba(0,0,0,0.95)',
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
