import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const GOLD = '#d8b26a';
const S = 1.5;
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };
const money = (value) => `RM${Math.round(value).toLocaleString('en-US')}`;

export const SeasonHUD = ({ month, matchday, debt, kitty, sceneFrom = 0, toFrame = Infinity }) => {
  const frame = useCurrentFrame() + sceneFrom;
  const { fps, height } = useVideoConfig();
  if (frame > toFrame) return null;

  const local = frame;
  const enter = spring({ frame: local, fps, config: { damping: 14, stiffness: 200, mass: 0.65 } });
  const scale = interpolate(enter, [0, 1], [0.82, 1], clamp);
  const opacity = interpolate(local, [0, 4], [0, 1], clamp);

  const row = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10 * S,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: Math.round(6 * S),
    padding: `${8 * S}px ${10 * S}px`,
  };
  const label = { color: 'rgba(216,178,106,0.92)', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: Math.round(11 * S), letterSpacing: 2 * S, textTransform: 'uppercase' };
  const value = { color: '#fff8e8', fontFamily: 'Arial Black, Arial, Helvetica, sans-serif', fontSize: Math.round(24 * S), lineHeight: 1, letterSpacing: 0.5 * S, textShadow: '0 2px 0 #000' };

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: Math.round(height * 0.115),
          right: 180,
          width: Math.round(390 * S),
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: 'right top',
          background: 'rgba(5, 8, 16, 0.88)',
          border: '1px solid rgba(216,178,106,0.42)',
          borderRadius: Math.round(8 * S),
          padding: `${12 * S}px ${14 * S}px`,
          boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
        }}
      >
        <div style={{ ...row, border: 'none', background: 'transparent', padding: 0, marginBottom: 9 * S }}>
          <span style={label}>Buluh FC • Divisyen 5</span>
          <span style={{ color: '#fff8e8', fontFamily: 'Arial Black, Arial, Helvetica, sans-serif', fontSize: Math.round(16 * S) }}>
            BULAN {month} • MD {matchday}
          </span>
        </div>
        <div style={row}>
          <span style={label}>Hutang</span>
          <span style={value}>{money(debt)}</span>
        </div>
        {kitty !== undefined ? (
          <div style={{ ...row, marginTop: 7 * S }}>
            <span style={label}>Kiti</span>
            <span style={value}>{money(kitty)}</span>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
