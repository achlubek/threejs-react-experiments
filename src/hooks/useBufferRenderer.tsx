import { useEffect, useMemo, useState } from "react";

import * as THREE from "three";

import { renderToTarget } from "@app/util/renderToTarget";

export interface BufferOnDrawParams {
  camera: THREE.Camera;
  scene: THREE.Scene;
  clock: THREE.Clock;
}

export interface BufferRendererPosition {
  x: number;
  y: number;
}

export interface UseBufferRendererPropsBase {
  onDraw?: ((params: BufferOnDrawParams) => void) | undefined;
  toneMapping?: THREE.ToneMapping | undefined;
  renderer: THREE.WebGLRenderer | null;
  width: number;
  height: number;
}

export interface UseBufferRendererProps extends UseBufferRendererPropsBase {
  camera: THREE.Camera;
  scene: THREE.Scene;
}

export interface BufferRenderer {
  texture: THREE.WebGLRenderTarget | null;
  render: () => void;
}

export default function useBufferRenderer(
  props: UseBufferRendererProps
): BufferRenderer {
  const [texture, setTexture] = useState<THREE.WebGLRenderTarget | null>(null);
  const [render, setRender] = useState<() => void>((): void => {
    /**/
  });
  const clock = useMemo(() => new THREE.Clock(), []);

  useEffect(() => {
    const texture = new THREE.WebGLRenderTarget(props.width, props.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });
    setTexture(texture);

    const render = (): void => {
      if (!props.renderer) {
        return;
      }

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

    setRender(render);

    return () => {
      texture.dispose();
    };
  }, [props.renderer]);

  return { render, texture };
}
