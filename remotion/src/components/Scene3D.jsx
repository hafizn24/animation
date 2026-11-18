import React, { useEffect, useRef, useState } from 'react';
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import * as THREE from 'three';

export const Scene3D = ({ director }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [bootHandle] = useState(() => delayRender('Building 3D scene'));

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

    engineRef.current = director(renderer, { width, height });
    continueRender(bootHandle);

    return () => {
      const engine = engineRef.current;
      if (engine && engine.dispose) engine.dispose();
      engineRef.current = null;
      renderer.dispose();
    };
  }, [width, height, director, bootHandle]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const handle = delayRender(`draw frame ${frame}`);
    engine.render(frame);
    continueRender(handle);
  }, [frame]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#05070d' }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ width, height, display: 'block' }}
      />
    </AbsoluteFill>
  );
};
