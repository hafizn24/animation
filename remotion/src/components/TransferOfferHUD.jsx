import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const GOLD = '#d8b26a';

export const TransferOfferHUD = ({ fromFrame, toFrame, sceneFrom = 0 }) => {
  const frame = useCurrentFrame() + sceneFrom;
  const { fps, height } = useVideoConfig();

  if (frame < fromFrame || frame > toFrame) return null;

  const local = frame - fromFrame;
  const span = Math.max(1, toFrame - fromFrame);
  const enter = spring({
    frame: local,
    fps,
    config: { damping: 14, stiffness: 200, mass: 0.65 },
  });
  const exit = interpolate(local, [span - 12, span], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(enter, [0, 1], [0.82, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = Math.min(interpolate(local, [0, 3], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }), exit);
  const flash = interpolate(local, [0, 10], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: Math.round(height * 0.115),
          left: 96,
          right: 116,
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: 'center top',
          background: 'rgba(8, 12, 20, 0.92)',
          border: `1px solid ${flash > 0 ? GOLD : 'rgba(216,178,106,0.55)'}`,
          borderRadius: 10,
          padding: '12px 14px 14px',
          boxShadow: `0 8px 30px rgba(0,0,0,0.8)${flash > 0 ? `, 0 0 ${Math.round(flash * 22)}px rgba(216,178,106,0.65)` : ''}`,
        }}
      >
        <div
          style={{
            color: GOLD,
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 14,
            fontWeight: 'bold',
            letterSpacing: 2.2,
            textAlign: 'center',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          Tawaran Rasmi — Kelab Divisyen 4
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <div
            style={{
              flex: 1.1,
              background: flash > 0 ? 'rgba(216,178,106,0.22)' : 'rgba(216,178,106,0.1)',
              border: `1px solid ${flash > 0 ? GOLD : 'rgba(216,178,106,0.4)'}`,
              borderRadius: 6,
              padding: '8px 6px 10px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                color: 'rgba(216,178,106,0.9)',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: 10,
                letterSpacing: 2,
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              Transfer Fee
            </div>
            <div
              style={{
                color: '#fff8e8',
                fontFamily: 'Arial Black, Arial, Helvetica, sans-serif',
                fontSize: 30,
                lineHeight: 1,
                letterSpacing: 0.5,
                textShadow: '0 2px 0 #000',
              }}
            >
              RM50,000
            </div>
          </div>
          <div
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.16)',
              borderRadius: 6,
              padding: '8px 6px 10px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                color: 'rgba(216,178,106,0.9)',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: 10,
                letterSpacing: 2,
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              Salary Relief
            </div>
            <div
              style={{
                color: '#f7f4ea',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: 22,
                fontWeight: 'bold',
                lineHeight: 1.15,
                letterSpacing: 0.4,
                textShadow: '0 2px 0 #000',
              }}
            >
              KOS GAJI: -35%
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
