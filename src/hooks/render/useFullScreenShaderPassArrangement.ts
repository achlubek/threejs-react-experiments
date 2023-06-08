import { useMemo } from "react";

import * as THREE from "three";

import { useScene } from "@app/hooks/render/useScene";

export interface FragmentShaderProps<
  UniType extends Record<string, THREE.IUniform>
> {
  fragmentShader: string;
  uniforms?: UniType | undefined;
}

export default function useFullScreenShaderPassArrangement<
  UniType extends Record<string, THREE.IUniform>
>(
  props: FragmentShaderProps<UniType>
): {
  scene: THREE.Scene;
  camera: THREE.Camera;
  setUniforms: (unis: UniType) => void;
} {
  const vertexShader = `
    varying vec2 UV;
    void main() {
        UV = uv;
        gl_Position = vec4(position, 1.0);
    }
  `;

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: props.uniforms,
        vertexShader,
        fragmentShader: props.fragmentShader,
        depthWrite: false,
        depthTest: false,
        blendEquationAlpha: THREE.NoBlending,
        transparent: true,
      }),
    []
  );

  const scene = useScene((s: THREE.Scene) => {
    s.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
  });

  const camera = useMemo(
    () => new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10.0),
    []
  );

  return {
    scene,
    camera,
    setUniforms: (unis: UniType) => (mat.uniforms = unis),
  };
}
