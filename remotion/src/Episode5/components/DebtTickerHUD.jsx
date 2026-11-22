import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const GOLD = '#d8b26a';
const S = 1.5;
const clampOpts = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };
const money = (value) => `RM${Math.round(value).toLocaleString('en-US')}`;

/**
 * Episode 5's animated debt ticker. Same visual language as TransferOfferHUD
 * (gold header, dark plate, flash-on-enter), rebuilt at the 1080x1920 scale and
 * extended with a live countdown of the club debt.
 *
 * Rows:
 *   TAWARAN DITERIMA : RM50,000      (stamp lands first)
 *   HUTANG KELAB     : RM381,500 -> RM331,500  (live tick)
 *   KOS GAJI         : -35%
 */
export const DebtTickerHUD = ({ config, sceneFrom = 0 }) => {
  const frame = useCurrentFrame() + sceneFrom;
  const { fps, height } = useVideoConfig();

  const { fromFrame, toFrame, tick } = config;
  if (frame < fromFrame || frame > toFrame) return null;

  const local = frame - fromFrame;
  const span = Math.max(1, toFrame - fromFrame);
  const enter = spring({ frame: local, fps, config: { damping: 14, stiffness: 200, mass: 0.65 } });
  const exit = interpolate(local, [span - 16, span], [1, 0], clampOpts);
  const scale = interpolate(enter, [0, 1], [0.82, 1], clampOpts);
  const opacity = Math.min(interpolate(local, [0, 4], [0, 1], clampOpts), exit);
  const flash = interpolate(local, [0, 12], [1, 0], clampOpts);

  const tickProgress = interpolate(frame, [tick.fromFrame, tick.toFrame], [0, 1], clampOpts);
  const debtValue = tick.from + (tick.to - tick.from) * tickProgress;
  const finalLanded = frame >= tick.toFrame - 6;
  const stampVisible = frame >= fromFrame + 15;

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
  const label = {
    color: 'rgba(216,178,106,0.92)',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: Math.round(11 * S),
    letterSpacing: 2 * S,
    textTransform: 'uppercase',
  };
  const value = {
    color: '#fff8e8',
    fontFamily: 'Arial Black, Arial, Helvetica, sans-serif',
    fontSize: Math.round(24 * S),
    lineHeight: 1,
    letterSpacing: 0.5 * S,
    textShadow: '0 2px 0 #000',
  };

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: Math.round(height * 0.115),
          left: 96 * S,
          right: 116 * S,
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: 'center top',
          background: 'rgba(8, 12, 20, 0.94)',
          border: `1px solid ${flash > 0 ? GOLD : 'rgba(216,178,106,0.55)'}`,
          borderRadius: Math.round(10 * S),
          padding: `${12 * S}px ${14 * S}px ${14 * S}px`,
          boxShadow: `0 12px 45px rgba(0,0,0,0.85)${flash > 0 ? `, 0 0 ${Math.round(flash * 30)}px rgba(216,178,106,0.7)` : ''}`,
        }}
      >
        <div
          style={{
            color: GOLD,
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: Math.round(14 * S),
            fontWeight: 'bold',
            letterSpacing: 2.2 * S,
            textAlign: 'center',
            textTransform: 'uppercase',
            marginBottom: 12 * S,
          }}
        >
          Tawaran Rasmi — Kelab Divisyen 4
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 * S }}>
          <div
            style={{
              ...row,
              borderColor: stampVisible ? GOLD : 'rgba(216,178,106,0.4)',
              background: stampVisible ? 'rgba(216,178,106,0.14)' : row.background,
            }}
          >
            <span style={label}>Tawaran Diterima</span>
            <span style={value}>{money(50000)}</span>
          </div>

          <div
            style={{
              ...row,
              borderColor: finalLanded ? GOLD : 'rgba(216,178,106,0.45)',
              background: finalLanded ? 'rgba(216,178,106,0.16)' : row.background,
              boxShadow: finalLanded ? `0 0 ${Math.round(18 * S)}px rgba(216,178,106,0.55)` : 'none',
            }}
          >
            <span style={label}>Hutang Kelab</span>
            <span style={{ ...value, fontSize: Math.round(28 * S) }}>{money(debtValue)}</span>
          </div>

          <div style={row}>
            <span style={label}>Kos Gaji</span>
            <span
              style={{
                color: '#f7f4ea',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: Math.round(22 * S),
                fontWeight: 'bold',
                lineHeight: 1.1,
                textShadow: '0 2px 0 #000',
              }}
            >
              {config.salaryCut}
            </span>
          </div>
        </div>

        {stampVisible ? (
          <div
            style={{
              position: 'absolute',
              right: 26 * S,
              top: -18 * S,
              transform: `rotate(-14deg) scale(${scale})`,
              border: `3px solid rgba(190,40,50,0.9)`,
              borderRadius: 6 * S,
              color: 'rgba(220,60,70,0.95)',
              fontFamily: 'Arial Black, Arial, sans-serif',
              fontSize: Math.round(15 * S),
              letterSpacing: 2 * S,
              padding: `${4 * S}px ${9 * S}px`,
              background: 'rgba(8,12,20,0.7)',
            }}
          >
            DITERIMA
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
