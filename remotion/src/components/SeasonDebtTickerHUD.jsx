import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const GOLD = '#d8b26a';
const GREEN = '#3ddc84';
const RED = '#ff4d5e';
const S = 1.5;
const clampOpts = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };
const money = (value, currency = 'RM') =>
  `${currency}${Math.round(Math.abs(value)).toLocaleString('en-US')}`;

/**
 * Season 1 debt ticker. `direction: 'down'` flashes green (wins),
 * `direction: 'up'` flashes red with a shake (crises), `'flat'` stays neutral.
 * Reads the debt progression from story/season1-debt.json via the episode's
 * overlay config, so the HUD and the JSON can never disagree.
 */
export const SeasonDebtTickerHUD = ({ config, sceneFrom = 0 }) => {
  const frame = useCurrentFrame() + sceneFrom;
  const { fps } = useVideoConfig();
  const {
    fromFrame, toFrame, label = 'HUTANG KELAB', from, to,
    direction = 'down', currency = 'RM', finalLabel = null, note = null,
  } = config;

  if (frame < fromFrame || frame > toFrame) return null;

  const local = frame - fromFrame;
  const span = Math.max(1, toFrame - fromFrame);
  const enter = spring({ frame: local, fps, config: { damping: 14, stiffness: 200, mass: 0.65 } });
  const exit = interpolate(local, [span - 16, span], [1, 0], clampOpts);
  const scale = interpolate(enter, [0, 1], [0.82, 1], clampOpts);
  const opacity = Math.min(interpolate(local, [0, 4], [0, 1], clampOpts), exit);
  const progress = interpolate(frame, [fromFrame + 8, toFrame - 12], [0, 1], clampOpts);
  const value = from + (to - from) * progress;
  const landed = progress >= 0.999;

  const tone = direction === 'up' ? RED : direction === 'down' ? GREEN : GOLD;
  const flash = interpolate(local, [0, 10, 20], [0.9, 0.45, 0], clampOpts);
  const shake = direction === 'up' ? Math.sin(local * 1.9) * 5 * (1 - interpolate(local, [0, 18], [1, 0], clampOpts)) : 0;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: 300,
          right: 190,
          minWidth: 470,
          opacity,
          transform: `translateX(${shake}px) scale(${scale})`,
          transformOrigin: 'center top',
          background: 'rgba(8, 12, 20, 0.94)',
          border: `2px solid ${tone}`,
          borderRadius: Math.round(10 * S),
          padding: `${12 * S}px ${16 * S}px`,
          boxShadow: `0 12px 45px rgba(0,0,0,0.85), 0 0 ${Math.round(flash * 34)}px ${tone}`,
        }}
      >
        <div
          style={{
            color: tone,
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: Math.round(13 * S),
            fontWeight: 'bold',
            letterSpacing: 2.4 * S,
            textAlign: 'center',
            textTransform: 'uppercase',
            marginBottom: 7 * S,
          }}
        >
          {label}
        </div>
        <div
          style={{
            color: landed ? tone : '#fff8e8',
            fontFamily: 'Arial Black, Arial, Helvetica, sans-serif',
            fontSize: Math.round(30 * S),
            lineHeight: 1,
            textAlign: 'center',
            letterSpacing: 0.5 * S,
            textShadow: '0 3px 0 #000',
          }}
        >
          {money(value, currency)}
        </div>
        {finalLabel && landed ? (
          <div
            style={{
              color: tone,
              fontFamily: 'Arial Black, Arial, sans-serif',
              fontSize: Math.round(19 * S),
              textAlign: 'center',
              marginTop: 8 * S,
              letterSpacing: 3 * S,
            }}
          >
            {finalLabel}
          </div>
        ) : null}
        {note ? (
          <div
            style={{
              color: 'rgba(216,178,106,0.85)',
              fontFamily: 'Arial, Helvetica, sans-serif',
              fontSize: Math.round(11 * S),
              textAlign: 'center',
              marginTop: 8 * S,
            }}
          >
            {note}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
