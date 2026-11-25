import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const GOLD = '#d8b26a';
const S = 1.5;
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };

export const HookTitle = ({ title, pill, fromFrame = 0, toFrame = 45 }) => {
  const frame = useCurrentFrame();
  const { fps, height, width } = useVideoConfig();
  const local = frame - fromFrame;
  if (local < 0 || local > toFrame) return null;

  const pop = spring({ frame: local, fps, config: { damping: 13, stiffness: 190, mass: 0.72 } });
  const scale = interpolate(pop, [0, 1], [0.74, 1], clamp);
  const enter = interpolate(local, [0, 2], [0.35, 1], clamp);
  const exit = interpolate(local, [toFrame - 8, toFrame], [1, 0], clamp);
  const opacity = Math.min(enter, exit);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: Math.round(height * 0.18),
          left: 56 * S,
          right: 180,
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: 'left center',
          textAlign: 'left',
        }}
      >
        {pill ? (
          <div style={{ display: 'inline-block', color: '#0c1016', background: GOLD, fontFamily: 'Arial, Helvetica, sans-serif', fontSize: Math.round(13 * S), fontWeight: 'bold', letterSpacing: 2.2 * S, padding: `${6 * S}px ${12 * S}px`, borderRadius: 4 * S, marginBottom: 14 * S, boxShadow: '0 6px 24px rgba(0,0,0,0.75)' }}>
            {pill}
          </div>
        ) : null}
        <div
          style={{
            color: '#fff8e8',
            fontFamily: 'Arial Black, Arial, Helvetica, sans-serif',
            fontSize: Math.round(40 * S),
            lineHeight: 1.1,
            fontWeight: 'bold',
            letterSpacing: 0.4 * S,
            textTransform: 'uppercase',
            textShadow: '0 4px 0 #7a1c12, 0 8px 0 rgba(0,0,0,0.55), 0 0 30px rgba(0,0,0,0.95)',
            background: 'linear-gradient(90deg, rgba(120,26,16,0.75), rgba(120,26,16,0))',
            borderLeft: `${6 * S}px solid ${GOLD}`,
            padding: `${12 * S}px ${16 * S}px`,
            borderRadius: 6 * S,
            maxWidth: Math.round(width * 0.72),
          }}
        >
          {title}
        </div>
      </div>
    </AbsoluteFill>
  );
};
