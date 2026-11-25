import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Scene3D } from './Scene3D.jsx';
import { SafeArea } from './SafeArea.jsx';
import { HookTitle } from './HookTitle.jsx';
import { DualSubtitles } from './DualSubtitles.jsx';
import { EndCard } from './EndCard.jsx';
import { SeasonDebtTickerHUD } from './SeasonDebtTickerHUD.jsx';
import { MatchHUD } from './MatchHUD.jsx';
import { StartingXICard } from './StartingXICard.jsx';
import { LeagueTableOverlay } from './LeagueTableOverlay.jsx';
import { Season2Hook } from './Season2Hook.jsx';

const clampOpts = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };
const asArray = (value) => (value == null ? [] : Array.isArray(value) ? value : [value]);

const CutFlash = () => {
  const frame = useCurrentFrame();
  if (frame >= 2) return null;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: `rgba(255,255,255,${0.2 * (1 - frame / 2)})`,
        pointerEvents: 'none',
      }}
    />
  );
};

const sceneLines = (scene) =>
  scene.lines.map((line) => ({
    ...line,
    start: (line.subtitleStartFrame ?? line.startFrame) - scene.fromFrame,
    end: line.endFrame - scene.fromFrame,
    narration: line.type === 'narrator' || line.type === 'narration',
  }));

/**
 * One composition driver for every Season 1 episode (Ep. 6-12).
 * All timings come from the episode's audio-script.json — the JSON wins,
 * including the BGM beds (script.bgm) unless the composition overrides them.
 */
export const SeasonEpisode = ({ episode, script, directors, bgm }) => {
  const { scenes, overlays = {}, totalFrames } = script;
  const beds = (bgm && bgm.length ? bgm : script.bgm) || [];
  const allLines = scenes.flatMap((scene) => scene.lines || []);
  const allCues = scenes.flatMap((scene) => (scene.cues || []).map((cue) => ({ ...cue })));
  const outro = overlays.outroCard || {
    fromFrame: totalFrames - 72,
    toFrame: totalFrames,
    durationFrames: 72,
  };
  const isTalking = (frame) =>
    allLines.some((line) => frame >= line.startFrame - 2 && frame < line.endFrame + 2);

  const volumeFor = (bed) => (frame) => {
    if (frame < bed.from || frame >= bed.to) return 0;
    const fadeIn = interpolate(frame, [bed.from, bed.from + 14], [0, 1], clampOpts);
    const fadeOut = interpolate(frame, [bed.to - 22, bed.to], [1, 0], clampOpts);
    const level = isTalking(frame) ? (bed.duck ?? 0.05) : (bed.level ?? 0.16);
    return Math.min(fadeIn, level) * fadeOut;
  };

  const overlayFor = (scene, isFirstScene) => {
    const nodes = [];
    const push = (key, Component, extraProps = {}) => {
      asArray(overlays[key]).forEach((config, index) => {
        if (!config) return;
        if (config.scene && config.scene !== scene.id) return;
        nodes.push(
          <Component
            key={`${key}-${index}`}
            config={config}
            sceneFrom={scene.fromFrame}
            {...extraProps}
          />
        );
      });
    };

    if (isFirstScene && overlays.hook) {
      const hook = overlays.hook;
      nodes.push(
        <HookTitle
          key="hook"
          title={hook.title}
          pill={hook.pill}
          fromFrame={0}
          toFrame={hook.toFrame ?? 45}
          scale={1.5}
        />
      );
    }

    push('debtTicker', SeasonDebtTickerHUD);
    push('matchHUD', MatchHUD);
    push('startingXI', StartingXICard);
    push('leagueTable', LeagueTableOverlay);
    push('season2Hook', Season2Hook);
    return nodes;
  };

  return (
    <AbsoluteFill style={{ backgroundColor: '#05070d' }}>
      {beds.map((bed, bedIndex) => (
        <Audio key={`${bed.file}-${bedIndex}`} src={staticFile(`audio/bgm/${bed.file}`)} volume={volumeFor(bed)} />
      ))}

      {allLines.map((line) => (
        <Sequence key={line.id} from={line.startFrame}>
          <Audio src={staticFile(`audio/tts/${line.id}.mp3`)} volume={1} />
        </Sequence>
      ))}
      {allCues.map((cue, index) => (
        <Sequence key={`${cue.file}-${cue.frame}-${index}`} from={cue.frame}>
          <Audio src={staticFile(`audio/sfx/${cue.file}`)} volume={cue.volume} />
        </Sequence>
      ))}

      {scenes.filter((scene) => scene.director && directors[scene.director]).map((scene, index) => (
        <Sequence key={scene.id} from={scene.fromFrame} durationInFrames={scene.durationFrames}>
          <Scene3D director={directors[scene.director]} />
          <SafeArea />
          <DualSubtitles lines={sceneLines(scene)} bilingual bottomPaddingRatio={0.28} sidePadding={180} />
          {overlayFor(scene, index === 0)}
          <CutFlash />
        </Sequence>
      ))}

      <Sequence from={outro.fromFrame} durationInFrames={outro.durationFrames}>
        <EndCard episode={episode} />
      </Sequence>
    </AbsoluteFill>
  );
};
