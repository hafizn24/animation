import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import league from '../../../story/division5-league.json';

const GOLD = '#d8b26a';
const GREEN = '#3ddc84';
const clampOpts = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };

/** Compact 6-row Divisyen 5 standings card. */
export const LeagueTableOverlay = ({ config, sceneFrom = 0 }) => {
  const frame = useCurrentFrame() + sceneFrom;
  const { fromFrame, toFrame, matchday = 3, highlight = 'BUL', note = null } = config;
  if (frame < fromFrame || frame > toFrame) return null;

  const rows = league.standings[String(matchday)] || league.standings['5'];
  const { fps } = useVideoConfig();
  const local = frame - fromFrame;
  const span = Math.max(1, toFrame - fromFrame);
  const enter = spring({ frame: local, fps, config: { damping: 16, stiffness: 180, mass: 0.7 } });
  const scale = interpolate(enter, [0, 1], [0.88, 1], clampOpts);
  const opacity = Math.min(
    interpolate(local, [0, 6], [0, 1], clampOpts),
    interpolate(local, [span - 10, span], [1, 0], clampOpts)
  );

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: 250,
          left: 90,
          right: 190,
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: 'center top',
          background: 'rgba(8, 12, 20, 0.95)',
          border: `2px solid ${GOLD}`,
          borderRadius: 14,
          padding: '18px 20px',
          boxShadow: '0 16px 50px rgba(0,0,0,0.8)',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <div
          style={{
            color: GOLD,
            fontSize: 22,
            fontWeight: 'bold',
            letterSpacing: 3,
            textTransform: 'uppercase',
            marginBottom: 14,
            textAlign: 'center',
          }}
        >
          Kedudukan • Divisyen 5 (M{matchday})
        </div>
        <div style={{ display: 'flex', color: 'rgba(216,178,106,0.8)', fontSize: 14, padding: '0 10px 8px' }}>
          <span style={{ width: 52 }}>POS</span>
          <span style={{ flex: 1 }}>KELAB</span>
          <span style={{ width: 54, textAlign: 'center' }}>M</span>
          <span style={{ width: 64, textAlign: 'right' }}>MATA</span>
        </div>
        {rows.map((row) => {
          const isChampion = row.pos === 1;
          const isBuluh = row.club === highlight;
          const tone = isChampion ? GREEN : isBuluh ? GOLD : '#f7f4ea';
          return (
            <div
              key={row.club}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 10px',
                borderRadius: 6,
                background: isBuluh ? 'rgba(216,178,106,0.16)' : isChampion ? 'rgba(61,220,132,0.12)' : 'transparent',
                border: isBuluh || isChampion ? `1px solid ${tone}` : '1px solid transparent',
                color: tone,
                fontSize: 19,
                fontWeight: isBuluh || isChampion ? 'bold' : 400,
              }}
            >
              <span style={{ width: 52 }}>{row.pos}</span>
              <span style={{ flex: 1 }}>{row.club}</span>
              <span style={{ width: 54, textAlign: 'center' }}>{row.played}</span>
              <span style={{ width: 64, textAlign: 'right' }}>{row.points}</span>
            </div>
          );
        })}
        {note ? (
          <div style={{ color: GREEN, fontSize: 15, textAlign: 'center', marginTop: 12 }}>{note}</div>
        ) : (
          <div style={{ color: 'rgba(216,178,106,0.85)', fontSize: 14, textAlign: 'center', marginTop: 12 }}>
            {matchday === 5 ? 'JUARA = PROMOSI DIVISYEN 4' : '1ST = PROMOSI DIV 4'}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
