import { useEffect, useMemo } from "react";

import * as THREE from "three";

export default function useRenderer(): THREE.WebGLRenderer {
  const renderer = useMemo(() => {
    //threeRenderer.outputColorSpace = "srgb";
    return new THREE.WebGLRenderer({
      depth: true,
      antialias: true,
      logarithmicDepthBuffer: true,
      alpha: true,
      stencil: false,
    });
  }, []);

  useEffect(() => {
    return () => {
      renderer.dispose();
    };
  }, []);

  return renderer;
}
