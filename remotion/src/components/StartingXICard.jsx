import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import league from '../../../story/division5-league.json';

const GOLD = '#d8b26a';
const clampOpts = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };
const ROWS = {
  '4-4-2': [4, 4, 2],
  '4-3-3': [4, 3, 3],
  '4-5-1': [4, 5, 1],
  '4-2-3-1': [4, 2, 3, 1],
  '3-4-3': [3, 4, 3],
};
const POS_ORDER = { GK: 0, RB: 1, CB: 1, LB: 1, DM: 2, CM: 2, RM: 2, LM: 2, AM: 3, RW: 3, LW: 3, ST: 4 };

/**
 * 2–3s 2D tactical card that sells a full 11-a-side lineup at zero Three.js
 * cost. Reads directly from story/division5-league.json; featured players get
 * a gold chip. Departed players (active:false) are excluded from the XI.
 */
export const StartingXICard = ({ config, sceneFrom = 0 }) => {
  const frame = useCurrentFrame() + sceneFrom;
  const { fromFrame, toFrame, teamShort = 'BUL' } = config;
  if (frame < fromFrame || frame > toFrame) return null;

  const team = league.teams.find((t) => t.short === teamShort) || league.teams[0];
  const formation = ROWS[team.formation] || [4, 4, 2];
  const squad = team.players
    .filter((p) => p.active !== false)
    .sort((a, b) => (POS_ORDER[a.pos] ?? 5) - (POS_ORDER[b.pos] ?? 5) || a.no - b.no)
    .slice(0, 11);

  const { fps, height } = useVideoConfig();
  const local = frame - fromFrame;
  const span = Math.max(1, toFrame - fromFrame);
  const enter = spring({ frame: local, fps, config: { damping: 16, stiffness: 170, mass: 0.7 } });
  const scale = interpolate(enter, [0, 1], [0.86, 1], clampOpts);
  const opacity = Math.min(
    interpolate(local, [0, 6], [0, 1], clampOpts),
    interpolate(local, [span - 10, span], [1, 0], clampOpts)
  );

  let cursor = 0;
  const rows = formation.map((count) => squad.slice(cursor, (cursor += count)));

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: Math.round(height * 0.2),
          left: 78,
          right: 190,
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: 'center top',
          background: 'linear-gradient(180deg, rgba(12,32,20,0.96), rgba(6,14,10,0.96))',
          border: `2px solid ${GOLD}`,
          borderRadius: 16,
          padding: '20px 22px 26px',
          boxShadow: '0 18px 60px rgba(0,0,0,0.8)',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <span style={{ color: '#fff8e8', fontSize: 28, fontWeight: 'bold', letterSpacing: 1 }}>
            {team.name}
          </span>
          <span style={{ color: GOLD, fontSize: 20, letterSpacing: 3 }}>{team.formation} • XI</span>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            background: 'repeating-linear-gradient(180deg, rgba(60,140,80,0.25) 0px, rgba(60,140,80,0.25) 34px, rgba(40,110,60,0.25) 34px, rgba(40,110,60,0.25) 68px)',
            border: '2px solid rgba(255,255,255,0.5)',
            borderRadius: 8,
            padding: '16px 10px',
          }}
        >
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} style={{ display: 'flex', justifyContent: 'space-around', gap: 6 }}>
              {row.map((player) => (
                <div
                  key={player.no}
                  style={{
                    minWidth: 92,
                    textAlign: 'center',
                    background: player.featured ? 'rgba(216,178,106,0.92)' : 'rgba(8,12,20,0.88)',
                    color: player.featured ? '#101216' : '#fff8e8',
                    border: `1px solid ${player.featured ? GOLD : 'rgba(255,255,255,0.35)'}`,
                    borderRadius: 7,
                    padding: '6px 4px',
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 'bold' }}>{player.no}</div>
                  <div style={{ fontSize: 12, letterSpacing: 0.5 }}>{player.name.toUpperCase()}</div>
                  <div style={{ fontSize: 10, opacity: 0.8 }}>{player.pos}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ color: 'rgba(216,178,106,0.9)', fontSize: 14, textAlign: 'center', marginTop: 12 }}>
          EMAS = PEMAIN UTAMA • 11-A-SIDE
        </div>
      </div>
    </AbsoluteFill>
  );
};
