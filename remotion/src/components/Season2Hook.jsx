import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const GOLD = '#d8b26a';
const S = 1.5;
const clampOpts = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };

/** Season 2 tease card — in-world fixture notification. Never a CTA. */
export const Season2Hook = ({ config, sceneFrom = 0 }) => {
  const frame = useCurrentFrame() + sceneFrom;
  const { fps, height } = useVideoConfig();
  const { fromFrame, toFrame, title = 'DIVISYEN 4', subtitle = 'LAWAN PERTAMA: KELAB KARIM' } = config;
  if (frame < fromFrame || frame > toFrame) return null;

  const local = frame - fromFrame;
  const span = Math.max(1, toFrame - fromFrame);
  const enter = spring({ frame: local, fps, config: { damping: 15, stiffness: 190, mass: 0.7 } });
  const scale = interpolate(enter, [0, 1], [0.84, 1], clampOpts);
  const opacity = Math.min(
    interpolate(local, [0, 6], [0, 1], clampOpts),
    interpolate(local, [span - 10, span], [1, 0], clampOpts)
  );

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: Math.round(height * 0.36),
          left: Math.round(90 * S),
          right: Math.round(190 * S),
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          background: 'rgba(8, 12, 20, 0.95)',
          border: `2px solid ${GOLD}`,
          borderRadius: Math.round(14 * S),
          padding: `${Math.round(22 * S)}px ${Math.round(20 * S)}px`,
          boxShadow: '0 18px 60px rgba(0,0,0,0.85)',
          fontFamily: 'Arial, Helvetica, sans-serif',
          textAlign: 'center',
        }}
      >
        <div style={{ color: GOLD, fontSize: Math.round(15 * S), letterSpacing: 4 * S, marginBottom: Math.round(10 * S) }}>
          NOTIS PERLAWANAN • MUSIM 2
        </div>
        <div style={{ color: '#fff8e8', fontSize: Math.round(40 * S), fontWeight: 'bold', letterSpacing: 2 * S }}>
          {title}
        </div>
        <div style={{ margin: `${Math.round(16 * S)}px auto`, width: Math.round(220 * S), height: 3, backgroundColor: GOLD }} />
        <div style={{ color: '#f7f4ea', fontSize: Math.round(23 * S), fontWeight: 'bold', lineHeight: 1.3 }}>
          {subtitle}
        </div>
        <div style={{ color: 'rgba(216,178,106,0.85)', fontSize: Math.round(14 * S), marginTop: Math.round(14 * S) }}>
          BULUH FC • KELAB LAMA KARIM
        </div>
      </div>
    </AbsoluteFill>
  );
};
