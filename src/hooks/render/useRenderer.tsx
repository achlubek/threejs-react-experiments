import { useEffect, useMemo } from "react";

import * as THREE from "three";

export default function useRenderer(): THREE.WebGLRenderer {
  const renderer = useMemo(() => {
    const threeRenderer = new THREE.WebGLRenderer({
      depth: true,
      antialias: true,
      logarithmicDepthBuffer: true,
      alpha: true,
      stencil: false,
    });
    threeRenderer.outputColorSpace = "srgb";
    return threeRenderer;
  }, []);

  useEffect(() => {
    return () => {
      renderer.dispose();
    };
  }, []);

  return renderer;
}
