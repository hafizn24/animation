import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

const GOLD = '#d8b26a';

export const Subtitles = ({ lines, narrator }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();

  const activeLine = [...lines].reverse().find((line) => frame >= line.start && frame < line.end);
  const activeNarrator = Boolean(narrator) && frame >= 0 && frame < 80;
  if (!activeLine && !activeNarrator) return null;

  const opacityFor = (start, end) =>
    Math.max(0, Math.min(Math.min(1, (frame - start) / 8), Math.min(1, (end - frame) / 8)));
  const narratorOpacity = activeNarrator ? opacityFor(0, 80) : 0;
  const lineOpacity = activeLine ? opacityFor(activeLine.start, activeLine.end) : 0;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: `0 44px ${Math.round(height * 0.13)}px`,
        pointerEvents: 'none',
      }}
    >
      {activeNarrator && (
        <div
          style={{
            width: '100%',
            maxWidth: 640,
            textAlign: 'center',
            opacity: narratorOpacity,
            transform: `translateY(${(1 - narratorOpacity) * 12}px)`,
            marginBottom: 20,
            background: 'rgba(5, 8, 16, 0.82)',
            border: '1px solid rgba(216, 178, 106, 0.28)',
            borderRadius: 10,
            padding: '12px 18px',
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div
            style={{
              color: GOLD,
              fontFamily: 'Georgia, serif',
              fontSize: 24,
              fontStyle: 'italic',
              letterSpacing: 1,
              textShadow: '0 2px 0 #000, 0 0 10px rgba(0,0,0,0.95)',
            }}
          >
            {narrator}
          </div>
        </div>
      )}
      {activeLine && (
        <div
          style={{
            width: '100%',
            maxWidth: 620,
            textAlign: 'center',
            opacity: lineOpacity,
            transform: `translateY(${(1 - lineOpacity) * 12}px)`,
            background: 'rgba(5, 8, 16, 0.8)',
            border: '1px solid rgba(216, 178, 106, 0.22)',
            borderRadius: 10,
            padding: '14px 18px',
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.6)',
          }}
        >
          {activeLine.speaker ? (
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
              {activeLine.speaker}
            </div>
          ) : null}
          <div
            style={{
              color: '#f7f4ea',
              fontFamily: 'Arial, Helvetica, sans-serif',
              fontSize: activeLine.emphasis ? 40 : 36,
              lineHeight: 1.28,
              fontWeight: activeLine.emphasis ? 'bold' : 500,
              letterSpacing: 0.4,
              textShadow: '0 2px 0 #000, 0 0 10px rgba(0,0,0,0.95), 0 3px 18px rgba(0,0,0,0.95)',
            }}
          >
            {activeLine.text}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
