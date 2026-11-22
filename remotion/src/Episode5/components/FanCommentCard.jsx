import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const GOLD = '#d8b26a';
const clampOpts = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };

/**
 * Fan-inspired Easter egg for @akudingin-d1f. A stylised in-world YouTube
 * comment card that pops for 1.5s when Azam enters. It is a fan detail only —
 * deliberately contains no like/comment/subscribe prompt.
 */
export const FanCommentCard = ({ config, sceneFrom = 0 }) => {
  const frame = useCurrentFrame() + sceneFrom;
  const { fps, height, width } = useVideoConfig();
  const { fromFrame, toFrame, handle, comment, detail } = config;

  if (frame < fromFrame || frame > toFrame) return null;

  const local = frame - fromFrame;
  const span = toFrame - fromFrame;
  const pop = spring({ frame: local, fps, config: { damping: 12, stiffness: 210, mass: 0.6 } });
  const scale = interpolate(pop, [0, 1], [0.76, 1], clampOpts);
  const enter = interpolate(local, [0, 3], [0, 1], clampOpts);
  const exit = interpolate(local, [span - 9, span], [1, 0], clampOpts);
  const opacity = Math.min(enter, exit);
  const slide = interpolate(local, [0, 10], [18, 0], clampOpts);

  const cardWidth = Math.round(width * 0.62);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: Math.round(height * 0.3),
          left: Math.round(width * 0.13),
          width: cardWidth,
          opacity,
          transform: `translateY(${slide}px) scale(${scale}) rotate(-1.5deg)`,
          transformOrigin: 'left center',
          background: 'rgba(14, 18, 26, 0.93)',
          border: '1px solid rgba(216,178,106,0.6)',
          borderRadius: 14,
          padding: '16px 20px 18px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.85), 0 0 26px rgba(216,178,106,0.22)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              flexShrink: 0,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #d8b26a, #8a5a2b)',
              border: '2px solid rgba(255,248,232,0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0c1016',
              fontFamily: 'Arial Black, Arial, sans-serif',
              fontSize: 24,
            }}
          >
            A
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                color: GOLD,
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: 15,
                fontWeight: 'bold',
                letterSpacing: 1.6,
                marginBottom: 4,
              }}
            >
              {handle}
            </div>
            <div
              style={{
                color: '#f7f4ea',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: 30,
                lineHeight: 1.15,
              }}
            >
              &ldquo;{comment}&rdquo;
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: '1px solid rgba(255,255,255,0.16)',
            color: '#c7c3b8',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 18,
            letterSpacing: 0.4,
          }}
        >
          {detail}
        </div>
      </div>
    </AbsoluteFill>
  );
};
