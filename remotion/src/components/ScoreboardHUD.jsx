import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const GOLD = '#d8b26a';

/**
 * Episode 3 broadcast scoreboard. `goals` comes straight from
 * episodes/episode-3/audio-script.json event timings (absolute frames), so the
 * score flip is locked to the actual goal impacts. Sits at the very top of
 * SafeArea (y ~10%–16%) — clear of HookTitle, subtitles and Shorts dead zones.
 */
export const ScoreboardHUD = ({ goals = [], sceneFrom = 0 }) => {
  const frame = useCurrentFrame() + sceneFrom;
  const { fps, height } = useVideoConfig();

  const landed = goals.filter((goal) => goal.absoluteFrame <= frame);
  const current = landed.length ? landed[landed.length - 1].score : [0, 0];
  const last = landed.length ? landed[landed.length - 1] : null;

  const flip = last
    ? spring({
        frame: frame - last.absoluteFrame,
        fps,
        config: { damping: 11, stiffness: 210, mass: 0.6 },
      })
    : 1;
  const flash = last
    ? interpolate(frame - last.absoluteFrame, [0, 10], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;
  const pop = last && frame - last.absoluteFrame < 18 ? 1 + 0.24 * (1 - flip) : 1;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: Math.round(height * 0.1),
          left: 114,
          right: 114,
          transform: `scale(${pop})`,
          transformOrigin: 'center top',
          background: flash > 0
            ? `rgba(60, ${Math.round(34 + flash * 90)}, ${Math.round(20 + flash * 60)}, 0.94)`
            : 'rgba(8, 12, 20, 0.88)',
          border: `1px solid ${flash > 0 ? GOLD : 'rgba(216,178,106,0.45)'}`,
          borderRadius: 8,
          padding: '9px 14px 11px',
          boxShadow: `0 6px 26px rgba(0,0,0,0.75)${flash > 0 ? `, 0 0 ${Math.round(flash * 26)}px rgba(216,178,106,0.8)` : ''}`,
        }}
      >
        <div
          style={{
            color: 'rgba(216,178,106,0.85)',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 10,
            letterSpacing: 3.2,
            textAlign: 'center',
            marginBottom: 5,
            textTransform: 'uppercase',
          }}
        >
          Perlawanan Persahabatan
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontWeight: 'bold',
            letterSpacing: 1.4,
          }}
        >
          <span style={{ color: '#f7f4ea', fontSize: 19, whiteSpace: 'nowrap' }}>BULUH FC</span>
          <span
            style={{
              color: '#fff8e8',
              fontSize: 34,
              lineHeight: 1,
              letterSpacing: 2,
              padding: '4px 12px',
              borderRadius: 5,
              background: flash > 0 ? 'rgba(216,178,106,0.28)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${flash > 0 ? GOLD : 'rgba(255,255,255,0.14)'}`,
              whiteSpace: 'nowrap',
            }}
          >
            {current[0]} - {current[1]}
          </span>
          <span style={{ color: '#f7f4ea', fontSize: 19, whiteSpace: 'nowrap' }}>HULUBALANG</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
