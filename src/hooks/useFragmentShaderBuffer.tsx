import { useMemo } from "react";

import * as THREE from "three";

import useBufferRenderer, {
  BufferOnDrawParams,
  BufferRenderer,
  UseBufferRendererPropsBase,
} from "@app/hooks/useBufferRenderer";
import { useScene } from "@app/hooks/useScene";

export interface CameraViewProps<UniType extends Record<string, THREE.IUniform>>
  extends UseBufferRendererPropsBase {
  onDraw?: ((params: BufferOnDrawParams) => UniType) | undefined;
  fragmentShader: string;
  uniforms?: UniType | undefined;
}

export default function useFragmentShaderBuffer<
  UniType extends Record<string, THREE.IUniform>
>(props: CameraViewProps<UniType>): BufferRenderer {
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
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    quad.name = "quadX";
    quad.userData = {
      material: mat,
    };
    s.add(quad);
  });

  const onDraw = (params: BufferOnDrawParams): void => {
    if (props.onDraw) {
      mat.uniforms = props.onDraw(params);
    }
  };

  const camera = useMemo(
    () => new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10.0),
    []
  );

  return useBufferRenderer({
    ...props,
    scene,
    camera,
    onDraw,
    toneMapping: THREE.NoToneMapping,
  });
}
