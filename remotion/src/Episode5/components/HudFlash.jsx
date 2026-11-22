import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const GOLD = '#d8b26a';
const clampOpts = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };

/** Compact tablet HUD Bos holds up on the final "Lima ringgit" punchline. */
export const HudFlash = ({ config, sceneFrom = 0 }) => {
  const frame = useCurrentFrame() + sceneFrom;
  const { fps, height } = useVideoConfig();
  const { fromFrame, toFrame, label, value } = config;

  if (frame < fromFrame || frame > toFrame) return null;

  const local = frame - fromFrame;
  const span = toFrame - fromFrame;
  const pop = spring({ frame: local, fps, config: { damping: 14, stiffness: 220, mass: 0.6 } });
  const scale = interpolate(pop, [0, 1], [0.84, 1], clampOpts);
  const opacity = Math.min(
    interpolate(local, [0, 4], [0, 1], clampOpts),
    interpolate(local, [span - 12, span], [1, 0], clampOpts)
  );
  const flash = interpolate(local, [0, 14], [1, 0], clampOpts);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: Math.round(height * 0.4),
          right: 172,
          width: 380,
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: 'right top',
          background: 'rgba(8,12,20,0.94)',
          border: `1px solid ${flash > 0 ? GOLD : 'rgba(216,178,106,0.6)'}`,
          borderRadius: 12,
          padding: '14px 16px 16px',
          boxShadow: `0 10px 34px rgba(0,0,0,0.85)${flash > 0 ? `, 0 0 26px rgba(216,178,106,0.6)` : ''}`,
        }}
      >
        <div
          style={{
            color: GOLD,
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 15,
            fontWeight: 'bold',
            letterSpacing: 3,
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          {label}
        </div>
        <div
          style={{
            color: '#fff8e8',
            fontFamily: 'Arial Black, Arial, Helvetica, sans-serif',
            fontSize: 40,
            lineHeight: 1,
            textAlign: 'center',
            textShadow: '0 2px 0 #000',
          }}
        >
          {value}
        </div>
      </div>
    </AbsoluteFill>
  );
};
