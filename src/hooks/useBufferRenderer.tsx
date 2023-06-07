import { useEffect, useMemo, useState } from "react";

import * as THREE from "three";
import { Vector4 } from "three";

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
      magFilter: THREE.NearestFilter,
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

      const oldRenderTarget = props.renderer.getRenderTarget();
      const oldViewport = props.renderer.getViewport(new Vector4());
      const oldToneMapping = props.renderer.toneMapping;

      props.renderer.setRenderTarget(texture);
      props.renderer.setViewport(0, 0, props.width, props.height);
      props.renderer.toneMapping = props.toneMapping ?? oldToneMapping;

      props.renderer.render(props.scene, props.camera);

      props.renderer.setRenderTarget(oldRenderTarget);
      props.renderer.setViewport(oldViewport);
      props.renderer.toneMapping = oldToneMapping;
    };

    setRender(render);

    return () => {
      texture.dispose();
    };
  }, [props.renderer]);

  return { render, texture };
}
