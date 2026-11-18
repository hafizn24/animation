import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

const GOLD = '#d8b26a';

export const Subtitles = ({ lines }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();

  const active = [...lines].reverse().find((line) => frame >= line.start && frame < line.end);
  if (!active) return null;

  const fadeIn = Math.min(1, (frame - active.start) / 8);
  const fadeOut = Math.min(1, (active.end - frame) / 8);
  const opacity = Math.max(0, Math.min(fadeIn, fadeOut));

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: `0 44px ${Math.round(height * 0.13)}px`,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 620,
          textAlign: 'center',
          opacity,
          transform: `translateY(${(1 - opacity) * 12}px)`,
        }}
      >
        {active.speaker ? (
          <div
            style={{
              color: GOLD,
              fontFamily: 'Arial, Helvetica, sans-serif',
              fontSize: 17,
              fontWeight: 'bold',
              letterSpacing: 5,
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            {active.speaker}
          </div>
        ) : null}
        <div
          style={{
            color: '#f7f4ea',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: active.emphasis ? 44 : 39,
            lineHeight: 1.28,
            fontWeight: active.emphasis ? 'bold' : 500,
            letterSpacing: 0.4,
            textShadow: '0 3px 18px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.9)',
          }}
        >
          {active.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
