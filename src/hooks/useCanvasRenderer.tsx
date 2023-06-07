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
  canvas: HTMLCanvasElement;
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
  overlayRef: React.MutableRefObject<HTMLDivElement | null>;
}

export default function useCanvasRenderer(props: CanvasProps): CanvasRenderer {
  const { elementClassName, camera, scene, onDraw, onResize } = props;
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const clock = useMemo(() => new THREE.Clock(), []);

  useEffect(() => {
    if (canvasRef.current && overlayRef.current) {
      const threeRenderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        depth: true,
        antialias: true,
        logarithmicDepthBuffer: true,
        alpha: true,
        stencil: false,
      });
      threeRenderer.setSize(
        overlayRef.current.clientWidth,
        overlayRef.current.clientHeight
      );
      threeRenderer.toneMapping = THREE.ACESFilmicToneMapping;
      threeRenderer.outputColorSpace = "srgb";
      setRenderer(threeRenderer);
    }
  }, [canvasRef, canvasRef.current, overlayRef, overlayRef.current]);

  const element = (
    <div
      ref={overlayRef}
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
    overlayRef,
  };

  useEffect(() => {
    let disposed = false;
    if (renderer) {
      const renderLoop = (): void => {
        let size = new Vector2(0, 0);
        size = renderer.getSize(size);
        if (
          overlayRef.current &&
          (size.x !== overlayRef.current.clientWidth ||
            size.y !== overlayRef.current.clientHeight)
        ) {
          renderer.setSize(
            overlayRef.current.clientWidth,
            overlayRef.current.clientHeight
          );
          onResize(
            overlayRef.current.clientWidth,
            overlayRef.current.clientHeight
          );
        }
        renderer.render(scene, camera);
        if (canvasRef.current) {
          onDraw({
            canvasRenderer,
            width: size.x,
            height: size.y,
            canvas: canvasRef.current,
          });
        }
        if (!disposed) {
          requestAnimationFrame(() => renderLoop());
        }
      };
      requestAnimationFrame(() => renderLoop());
    }
    return () => {
      disposed = true;
    };
  }, [canvasRef, overlayRef, renderer, scene, camera]);

  return canvasRenderer;
}