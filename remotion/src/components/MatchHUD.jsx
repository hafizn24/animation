import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

const GOLD = '#d8b26a';
const S = 1.5;
const clampOpts = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };

/**
 * Broadcast score pill. `steps` lets the score tick live during a match act:
 * [{ frame, home, away, clock }, ...] in absolute composition frames.
 */
export const MatchHUD = ({ config, sceneFrom = 0 }) => {
  const frame = useCurrentFrame() + sceneFrom;
  const { fromFrame, toFrame, matchday, homeShort, awayShort, homeColor, awayColor, steps = [] } = config;
  if (frame < fromFrame || frame > toFrame) return null;

  const local = frame - fromFrame;
  const span = Math.max(1, toFrame - fromFrame);
  const opacity = Math.min(
    interpolate(local, [0, 4], [0.85, 1], clampOpts),
    interpolate(local, [span - 12, span], [1, 0], clampOpts)
  );
  let score = { home: 0, away: 0, clock: "'" };
  steps.forEach((step) => {
    if (frame >= step.frame) score = step;
  });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: Math.round(118 * S),
          left: Math.round(64 * S),
          display: 'flex',
          alignItems: 'center',
          gap: Math.round(18 * S),
          opacity,
          background: 'rgba(8, 12, 20, 0.92)',
          border: `1px solid ${GOLD}`,
          borderRadius: Math.round(10 * S),
          padding: `${Math.round(12 * S)}px ${Math.round(20 * S)}px`,
          boxShadow: '0 8px 26px rgba(0,0,0,0.7)',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <span style={{ color: GOLD, fontSize: Math.round(18 * S), fontWeight: 'bold', letterSpacing: 2 * S }}>
          DIV 5 • M{matchday}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: Math.round(10 * S), fontSize: Math.round(26 * S), fontWeight: 'bold' }}>
          <span style={{ color: homeColor || '#fff8e8' }}>{homeShort}</span>
          <span style={{ color: '#fff8e8' }}>
            {score.home} - {score.away}
          </span>
          <span style={{ color: awayColor || '#fff8e8' }}>{awayShort}</span>
        </span>
        <span style={{ color: '#d6d3ca', fontSize: Math.round(17 * S) }}>{score.clock}</span>
      </div>
    </AbsoluteFill>
  );
};
