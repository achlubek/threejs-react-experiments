import { useEffect, useMemo } from "react";

import * as THREE from "three";

import { renderToTarget } from "@app/util/renderToTarget";

export interface BufferOnDrawParams {
  camera: THREE.Camera;
  scene: THREE.Scene;
  clock: THREE.Clock;
}

export interface UseBufferRendererPropsBase {
  renderer: THREE.WebGLRenderer;
  width: number;
  height: number;
  onDraw?: ((params: BufferOnDrawParams) => void) | undefined;
  toneMapping?: THREE.ToneMapping | undefined;
}

export interface UseBufferRendererProps extends UseBufferRendererPropsBase {
  camera: THREE.Camera;
  scene: THREE.Scene;
}

export interface BufferRenderer {
  texture: THREE.WebGLRenderTarget;
  render: () => void;
}

export default function useBufferRenderer(
  props: UseBufferRendererProps
): BufferRenderer {
  const clock = useMemo(() => new THREE.Clock(), []);

  const texture = useMemo(
    () =>
      new THREE.WebGLRenderTarget(props.width, props.height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
      }),
    []
  );

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

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
      target: texture,
    });
  };

  return { render, texture };
}
