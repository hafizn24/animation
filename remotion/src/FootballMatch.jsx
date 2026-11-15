import React, { useEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';
import { createMatchScene } from './scene/MatchScene.js';

/**
 * FootballMatch – 10 second cinematic football sequence.
 * One hard cut every three seconds (4 shots at 30fps).
 */
export const FootballMatch = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  // Hold the first frame until the 3D scene is built
  const [bootHandle] = useState(() => delayRender('Building 3D scene'));

  // Build the scene once
  useEffect(() => {
    if (!canvasRef.current) return undefined;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(1);
    renderer.setSize(width, height, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    engineRef.current = createMatchScene(renderer);
    continueRender(bootHandle);

    return () => {
      engineRef.current = null;
      renderer.dispose();
    };
  }, [width, height, bootHandle]);

  // Draw the current frame deterministically
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const handle = delayRender(`draw frame ${frame}`);
    engine.render(frame);
    continueRender(handle);
  }, [frame]);

  const shotIndex = Math.min(3, Math.floor(frame / 90));
  const shotStart = shotIndex * 90;

  // A one frame flash masks each hard cut
  const flash = frame - shotStart < 1 ? 0.16 : 0;

  const barHeight = Math.round((height - height / 2.39) / 2);

  return (
    <AbsoluteFill style={{ backgroundColor: '#05070d' }}>
      <canvas ref={canvasRef} width={width} height={height} style={{ width, height, display: 'block' }} />

      {/* Cinematic grade */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 100%)',
          pointerEvents: 'none',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(30,60,120,0.18) 0%, rgba(0,0,0,0) 45%, rgba(120,60,20,0.14) 100%)',
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />

      {/* 2.39:1 letterbox */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: barHeight,
          backgroundColor: '#000',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: barHeight,
          backgroundColor: '#000',
          pointerEvents: 'none',
        }}
      />

      {/* Opening title */}
      {shotIndex === 0 ? (
        <AbsoluteFill
          style={{
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            padding: `0 0 ${barHeight + 60}px 120px`,
            opacity: Math.min(1, frame / 18) * Math.min(1, (88 - frame) / 18),
          }}
        >
          <div>
            <div
              style={{
                color: '#f4f1e4',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: 22,
                letterSpacing: 10,
                textTransform: 'uppercase',
                opacity: 0.85,
              }}
            >
              Oakhaven United F.C.
            </div>
            <div
              style={{
                color: '#f4f1e4',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: 58,
                fontWeight: 'bold',
                letterSpacing: 2,
                marginTop: 8,
                textShadow: '0 4px 24px rgba(0,0,0,0.7)',
              }}
            >
              THE OAKS · MATCHDAY
            </div>
            <div style={{ marginTop: 10, width: 120, height: 3, backgroundColor: '#d8b26a' }} />
          </div>
        </AbsoluteFill>
      ) : null}

      {/* Cut flash */}
      <AbsoluteFill
        style={{ backgroundColor: `rgba(255,255,255,${flash})`, pointerEvents: 'none' }}
      />
    </AbsoluteFill>
  );
};
