import { useEffect, useMemo } from "react";

import * as THREE from "three";

import useManualRenderTargetRenderer, {
  UseBufferRendererBase,
} from "@app/hooks/render/buffer/useManualRenderTargetRenderer";

export interface UseBackBufferRendererPropsBase extends UseBufferRendererBase {
  renderer: THREE.WebGLRenderer;
  width: number;
  height: number;
  onDraw?: (() => void) | undefined;
}

export interface BackBufferRendererRenderCallParams {
  camera: THREE.Camera;
  scene: THREE.Scene;
  toneMapping?: THREE.ToneMapping | undefined;
}

export interface BackBufferRenderer {
  getBackBuffer(): THREE.WebGLRenderTarget;
  render: (params: BackBufferRendererRenderCallParams) => void;
}

export default function useBackBufferRenderer(
  props: UseBackBufferRendererPropsBase
): BackBufferRenderer {
  const textures: [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget] = useMemo(
    () => [
      new THREE.WebGLRenderTarget(props.width, props.height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
      }),
      new THREE.WebGLRenderTarget(props.width, props.height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
      }),
    ],
    []
  );

  const currentState = {
    target: 0,
    back: 1,
  };

  const getTarget = (): THREE.WebGLRenderTarget =>
    textures[currentState.target];

  const getBackBuffer = (): THREE.WebGLRenderTarget =>
    textures[currentState.back];

  const toggleState = (): void => {
    currentState.back = currentState.back === 1 ? 0 : 1;
    currentState.target = currentState.target === 1 ? 0 : 1;
  };

  useEffect(() => {
    return () => {
      textures[0].dispose();
      textures[1].dispose();
    };
  }, []);

  const inner = useManualRenderTargetRenderer({
    renderer: props.renderer,
  });

  const render = (params: BackBufferRendererRenderCallParams): void => {
    if (props.onDraw) {
      props.onDraw();
    }
    inner.render({
      ...params,
      target: getTarget(),
    });
    toggleState();
  };

  return { render, getBackBuffer };
}
