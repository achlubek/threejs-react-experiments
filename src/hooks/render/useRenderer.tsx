import { useEffect, useState } from "react";

import * as THREE from "three";

export interface Renderer {
  renderer: THREE.WebGLRenderer | null;
}

export default function useRenderer(): Renderer {
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    const threeRenderer = new THREE.WebGLRenderer({
      depth: true,
      antialias: true,
      logarithmicDepthBuffer: true,
      alpha: true,
      stencil: false,
    });
    threeRenderer.outputColorSpace = "srgb";
    setRenderer(threeRenderer);
    return () => {
      threeRenderer.dispose();
    };
  }, []);

  return { renderer };
}
