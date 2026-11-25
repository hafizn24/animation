import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

const GOLD = '#d8b26a';
const S = 1.5;

export const Subtitles = ({ lines = [], bilingual = true, bottomPadding = 538, rightPadding = 180 }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const activeLine = [...lines].reverse().find((line) => frame >= line.startFrame && frame < line.endFrame);
  if (!activeLine) return null;

  const opacityFor = (start, end) =>
    Math.max(0, Math.min(Math.min(1, (frame - start) / 4), Math.min(1, (end - frame) / 4)));
  const opacity = opacityFor(activeLine.startFrame, activeLine.endFrame);
  const isNarration = Boolean(activeLine.narration);
  const isEmphasis = Boolean(activeLine.emphasis);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: `0 ${rightPadding}px ${Math.max(480, bottomPadding)}px`,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: Math.round(660 * S),
          textAlign: 'center',
          opacity,
          transform: `translateY(${(1 - opacity) * 12 * S}px)`,
          background: 'rgba(5, 8, 16, 0.82)',
          border: `1px solid rgba(216, 178, 106, ${isNarration ? 0.32 : 0.24})`,
          borderRadius: Math.round(10 * S),
          padding: `${Math.round(14 * S)}px ${Math.round(18 * S)}px`,
          boxShadow: '0 9px 36px rgba(0, 0, 0, 0.7)',
        }}
      >
        {activeLine.speaker && !isNarration ? (
          <div style={{ color: GOLD, fontFamily: 'Arial, Helvetica, sans-serif', fontSize: Math.round(17 * S), fontWeight: 'bold', letterSpacing: 5 * S, textTransform: 'uppercase', marginBottom: 10 * S }}>
            {activeLine.speaker}
          </div>
        ) : null}
        <div
          style={{
            color: isNarration ? GOLD : '#f7f4ea',
            fontFamily: isNarration ? 'Georgia, serif' : 'Arial, Helvetica, sans-serif',
            fontSize: Math.round((isEmphasis ? 40 : isNarration ? 24 : 36) * S),
            fontStyle: isNarration ? 'italic' : 'normal',
            lineHeight: 1.26,
            fontWeight: isEmphasis ? 'bold' : 500,
            letterSpacing: 0.4 * S,
            textShadow: '0 3px 0 #000, 0 0 14px rgba(0,0,0,0.95), 0 4px 24px rgba(0,0,0,0.95)',
          }}
        >
          {activeLine.text}
        </div>
        {bilingual && activeLine.translation ? (
          <div style={{ color: isNarration ? '#c9b38a' : '#c7c3b8', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: Math.round((isNarration ? 15 : 16) * S), fontStyle: isNarration ? 'italic' : 'normal', lineHeight: 1.3, marginTop: 9 * S, letterSpacing: 0.3 * S, textShadow: '0 2px 0 #000, 0 0 10px rgba(0,0,0,0.95)' }}>
            {activeLine.translation}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
