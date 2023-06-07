import React, {
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import * as THREE from "three";
import { Vector2 } from "three";

export interface CanvasOnDrawParams {
  canvasRenderer: CanvasRenderer;
  width: number;
  height: number;
}

export interface CanvasProps {
  camera: THREE.Camera;
  scene: THREE.Scene;
  onDraw: (params: CanvasOnDrawParams) => void;
  onResize: (width: number, height: number) => void;
  overlayRef: React.MutableRefObject<HTMLDivElement | null>;
  elementClassName?: string | undefined;
}

export interface CanvasRenderer {
  renderer: THREE.WebGLRenderer | null;
  clock: THREE.Clock;
  element: ReactElement;
  scene: THREE.Scene;
  camera: THREE.Camera;
}

export default function useCanvasRenderer(props: CanvasProps): CanvasRenderer {
  const { elementClassName, camera, scene, onDraw, onResize, overlayRef } =
    props;
  const divRef = overlayRef;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const clock = useMemo(() => new THREE.Clock(), []);

  useEffect(() => {
    if (canvasRef.current && divRef.current) {
      const threeRenderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        depth: true,
        antialias: true,
        logarithmicDepthBuffer: true,
        alpha: true,
        stencil: false,
      });
      threeRenderer.setSize(
        divRef.current.clientWidth,
        divRef.current.clientHeight
      );
      threeRenderer.toneMapping = THREE.ACESFilmicToneMapping;
      threeRenderer.outputColorSpace = "srgb";
      setRenderer(threeRenderer);
    }
  }, [canvasRef, canvasRef.current, divRef, divRef.current]);

  const element = (
    <div
      ref={divRef}
      className={elementClassName}
      style={{ overflow: "visible", position: "relative" }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", left: 0, top: 0 }}
      ></canvas>
    </div>
  );

  const canvasRenderer = {
    element,
    scene,
    camera,
    clock,
    renderer,
  };

  useEffect(() => {
    let disposed = false;
    if (renderer) {
      const renderLoop = (): void => {
        let size = new Vector2(0, 0);
        size = renderer.getSize(size);
        if (
          divRef.current &&
          (size.x !== divRef.current.clientWidth ||
            size.y !== divRef.current.clientHeight)
        ) {
          renderer.setSize(
            divRef.current.clientWidth,
            divRef.current.clientHeight
          );
          onResize(divRef.current.clientWidth, divRef.current.clientHeight);
        }
        renderer.render(scene, camera);
        onDraw({
          canvasRenderer,
          width: size.x,
          height: size.y,
        });
        if (!disposed) {
          requestAnimationFrame(() => renderLoop());
        }
      };
      requestAnimationFrame(() => renderLoop());
    }
    return () => {
      disposed = true;
    };
  }, [canvasRef, divRef, renderer, scene, camera]);

  return canvasRenderer;
}
