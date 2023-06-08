import { useEffect, useMemo } from "react";

import * as THREE from "three";

import { renderToTarget } from "@app/util/renderToTarget";

export interface BufferOnDrawParams {
  camera: THREE.Camera;
  scene: THREE.Scene;
  clock: THREE.Clock;
}

export interface UseBackBufferRendererPropsBase {
  renderer: THREE.WebGLRenderer;
  width: number;
  height: number;
  onDraw?: ((params: BufferOnDrawParams) => void) | undefined;
  toneMapping?: THREE.ToneMapping | undefined;
}

export interface UseBackBufferRendererProps
  extends UseBackBufferRendererPropsBase {
  camera: THREE.Camera;
  scene: THREE.Scene;
}

export interface BackBufferRenderer {
  getBackBuffer(): THREE.WebGLRenderTarget;
  render: () => void;
}

export default function useBackBufferRenderer(
  props: UseBackBufferRendererProps
): BackBufferRenderer {
  const clock = useMemo(() => new THREE.Clock(), []);

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

  const render = (): void => {
    if (props.onDraw) {
      props.onDraw({
        scene: props.scene,
        camera: props.camera,
        clock,
      });
    }

    renderToTarget({
      renderer: props.renderer,
      scene: props.scene,
      camera: props.camera,
      toneMapping: props.toneMapping,
      target: getTarget(),
    });

    toggleState();
  };

  return { render, getBackBuffer };
}
