import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const GOLD = '#d8b26a';

/**
 * Episode 3 hook overlay — a bold 3–5 word punch that spring-pops on frame 0
 * and clears by frame 45 (1.5s at 30fps).
 *
 * Rendered inside SafeArea and deliberately kept in the upper-left/centre zone:
 * right padding 120px > Shorts right-15% dead zone (108px at 720 wide), and the
 * whole block ends well above the bottom-25% dead zone and the subtitle plate.
 * The 1080x1920 Season 1 master passes scale={1.5} (right padding 180px > 162px).
 */
export const HookTitle = ({ title, pill, fromFrame = 0, toFrame = 45, scale: sizeScale = 1 }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const local = frame - fromFrame;

  if (local < 0 || local > toFrame) return null;

  const pop = spring({
    frame: local,
    fps,
    config: { damping: 13, stiffness: 190, mass: 0.72 },
  });
  const scale = interpolate(pop, [0, 1], [0.74, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const enter = interpolate(local, [0, 2], [0.75, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exit = interpolate(local, [toFrame - 8, toFrame], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = Math.min(enter, exit);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: Math.round(height * 0.18),
          left: Math.round(56 * sizeScale),
          right: Math.round(120 * sizeScale),
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: 'left center',
          textAlign: 'left',
        }}
      >
        {pill ? (
          <div
            style={{
              display: 'inline-block',
              color: '#0c1016',
              background: GOLD,
              fontFamily: 'Arial, Helvetica, sans-serif',
              fontSize: Math.round(13 * sizeScale),
              fontWeight: 'bold',
              letterSpacing: 2.2 * sizeScale,
              padding: `${Math.round(6 * sizeScale)}px ${Math.round(12 * sizeScale)}px`,
              borderRadius: Math.round(4 * sizeScale),
              marginBottom: Math.round(14 * sizeScale),
              boxShadow: '0 4px 16px rgba(0,0,0,0.7)',
            }}
          >
            {pill}
          </div>
        ) : null}
        <div
          style={{
            color: '#fff8e8',
            fontFamily: 'Arial Black, Arial, Helvetica, sans-serif',
            fontSize: Math.round(40 * sizeScale),
            lineHeight: 1.12,
            fontWeight: 'bold',
            letterSpacing: 0.4 * sizeScale,
            textTransform: 'uppercase',
            textShadow:
              '0 3px 0 #7a1c12, 0 6px 0 rgba(0,0,0,0.55), 0 0 22px rgba(0,0,0,0.95)',
            background: 'linear-gradient(90deg, rgba(120,26,16,0.72), rgba(120,26,16,0))',
            borderLeft: `${Math.round(6 * sizeScale)}px solid ${GOLD}`,
            padding: `${Math.round(12 * sizeScale)}px ${Math.round(16 * sizeScale)}px`,
            borderRadius: Math.round(6 * sizeScale),
          }}
        >
          {title}
        </div>
      </div>
    </AbsoluteFill>
  );
};
