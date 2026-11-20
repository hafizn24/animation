import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

const GOLD = '#d8b26a';

/**
 * Episode 1 dual-subtitle system, shared by every episode.
 *
 * - Narration  : italic warm gold serif at the bottom, no speaker label.
 * - Dialogue   : clean white sans-serif with an uppercase gold speaker label.
 *
 * Lines may be timed explicitly ({ start, end, narration: true }) or an episode
 * may pass a `narrator` string which is shown for the first 80 frames of a
 * sequence (Episode 1 legacy behaviour).
 */
export const Subtitles = ({
  lines = [],
  narrator,
  bilingual = false,
  bottomPaddingRatio = 0.13,
  sidePadding = 44,
}) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();

  const activeLine = [...lines].reverse().find((line) => frame >= line.start && frame < line.end);
  const isNarrationLine = Boolean(
    activeLine && (activeLine.narration || activeLine.type === 'narration')
  );
  const legacyNarrator = !activeLine && Boolean(narrator) && frame >= 0 && frame < 80;

  if (!activeLine && !legacyNarrator) return null;

  const opacityFor = (start, end) =>
    Math.max(0, Math.min(Math.min(1, (frame - start) / 8), Math.min(1, (end - frame) / 8)));

  const showDialogue = Boolean(activeLine) && !isNarrationLine;
  const narrationText = isNarrationLine ? activeLine.text : narrator;
  const narrationStart = isNarrationLine ? activeLine.start : 0;
  const narrationEnd = isNarrationLine ? activeLine.end : 80;
  const narrationOpacity = (isNarrationLine || legacyNarrator)
    ? opacityFor(narrationStart, narrationEnd)
    : 0;
  const lineOpacity = showDialogue ? opacityFor(activeLine.start, activeLine.end) : 0;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: `0 ${sidePadding}px ${Math.round(height * bottomPaddingRatio)}px`,
        pointerEvents: 'none',
      }}
    >
      {(isNarrationLine || legacyNarrator) && (
        <div
          style={{
            width: '100%',
            maxWidth: 640,
            textAlign: 'center',
            opacity: narrationOpacity,
            transform: `translateY(${(1 - narrationOpacity) * 12}px)`,
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
            {narrationText}
          </div>
          {bilingual && activeLine && activeLine.translation ? (
            <div
              style={{
                color: '#c9b38a',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: 15,
                fontStyle: 'italic',
                lineHeight: 1.3,
                marginTop: 8,
                textShadow: '0 2px 0 #000, 0 0 8px rgba(0,0,0,0.95)',
              }}
            >
              {activeLine.translation}
            </div>
          ) : null}
        </div>
      )}
      {showDialogue && (
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
          {bilingual && activeLine.translation ? (
            <div
              style={{
                color: '#c7c3b8',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: 16,
                lineHeight: 1.32,
                marginTop: 9,
                letterSpacing: 0.3,
                textShadow: '0 2px 0 #000, 0 0 8px rgba(0,0,0,0.95)',
              }}
            >
              {activeLine.translation}
            </div>
          ) : null}
        </div>
      )}
    </AbsoluteFill>
  );
};
