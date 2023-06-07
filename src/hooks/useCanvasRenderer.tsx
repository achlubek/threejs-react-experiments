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

export interface CanvasRendererPosition {
  x: number;
  y: number;
}

export interface CanvasRendererMouseEventParams {
  position: CanvasRendererPosition;
  intersects: THREE.Intersection[];
  rayDirection: THREE.Vector3;
}

export type UseCanvasRendererMouseEventHandler = (
  event: CanvasRendererMouseEventParams
) => void;

export type TouchEventParams = CanvasRendererMouseEventParams[];

export type UseCanvasRendererMultiTouchEventHandler = (
  event: TouchEventParams
) => void;

export interface UseCanvasRendererEvents {
  onDraw?: ((params: CanvasOnDrawParams) => void) | undefined;
  onResize?: ((width: number, height: number) => void) | undefined;
  onMouseMove?: UseCanvasRendererMouseEventHandler | undefined;
  onMouseDown?: UseCanvasRendererMouseEventHandler | undefined;
  onMouseUp?: UseCanvasRendererMouseEventHandler | undefined;
  onMouseEnter?: UseCanvasRendererMouseEventHandler | undefined;
  onMouseLeave?: UseCanvasRendererMouseEventHandler | undefined;
  onTouchMove?: UseCanvasRendererMultiTouchEventHandler | undefined;
  onTouchStart?: UseCanvasRendererMultiTouchEventHandler | undefined;
  onTouchEnd?: UseCanvasRendererMultiTouchEventHandler | undefined;
}

export interface UseCanvasRendererPropsBase extends UseCanvasRendererEvents {
  elementClassName?: string | undefined;
}

export interface UseCanvasRendererProps extends UseCanvasRendererPropsBase {
  camera: THREE.Camera;
  scene: THREE.Scene;
  toneMapping?: THREE.ToneMapping | undefined;
}

export interface CanvasRenderer {
  renderer: THREE.WebGLRenderer | null;
  clock: THREE.Clock;
  element: ReactElement;
  scene: THREE.Scene;
  camera: THREE.Camera;
  overlayRef: React.MutableRefObject<HTMLDivElement | null>;
}

export default function useCanvasRenderer(
  props: UseCanvasRendererProps
): CanvasRenderer {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const clock = useMemo(() => new THREE.Clock(), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

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
      threeRenderer.toneMapping =
        props.toneMapping ?? THREE.ACESFilmicToneMapping;
      threeRenderer.outputColorSpace = "srgb";
      setRenderer(threeRenderer);
      return () => {
        threeRenderer.dispose();
      };
    }
    return undefined;
  }, [canvasRef, canvasRef.current, overlayRef, overlayRef.current]);

  const calculateNormalizedMouseCoords = (
    clientX: number,
    clientY: number
  ): CanvasRendererPosition => {
    if (canvasRef.current) {
      const bbox = canvasRef.current.getBoundingClientRect();
      const xAbs = clientX - bbox.left;
      const yAbs = clientY - bbox.top;
      const xNorm = xAbs / bbox.width;
      const yNorm = yAbs / bbox.height;
      return { x: xNorm, y: yNorm };
    }
    return { x: 0, y: 0 };
  };

  const calculateNDCMouseCoords = (
    normalized: CanvasRendererPosition
  ): THREE.Vector2 => {
    if (canvasRef.current) {
      const xSnorm = normalized.x * 2 - 1;
      const ySnorm = -normalized.y * 2 + 1;
      return new THREE.Vector2(xSnorm, ySnorm);
    } else {
      return new THREE.Vector2(0, 0);
    }
  };

  const getIntersections = (pointer: THREE.Vector2): THREE.Intersection[] => {
    raycaster.setFromCamera(pointer, props.camera);
    return raycaster.intersectObjects(props.scene.children);
  };

  const handleMouseEvent = (
    e: React.MouseEvent,
    handler: ((event: CanvasRendererMouseEventParams) => void) | undefined
  ): void => {
    if (handler && canvasRef.current) {
      e.preventDefault();
      const position = calculateNormalizedMouseCoords(e.clientX, e.clientY);
      const intersects = getIntersections(calculateNDCMouseCoords(position));
      handler({
        position,
        intersects,
        rayDirection: raycaster.ray.direction,
      });
    }
  };

  const handleTouchEvent = (
    e: React.TouchEvent,
    handler: ((event: TouchEventParams) => void) | undefined
  ): void => {
    if (handler && canvasRef.current) {
      e.preventDefault();
      const touches: CanvasRendererMouseEventParams[] = [];
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches.item(i);
        const position = calculateNormalizedMouseCoords(t.clientX, t.clientY);
        const intersects = getIntersections(calculateNDCMouseCoords(position));
        touches.push({
          position,
          intersects,
          rayDirection: raycaster.ray.direction,
        });
      }
      handler(touches);
    }
  };

  const element = (
    <div
      ref={overlayRef}
      className={props.elementClassName}
      onMouseMove={(e) => handleMouseEvent(e, props.onMouseMove)}
      onMouseDown={(e) => handleMouseEvent(e, props.onMouseDown)}
      onMouseUp={(e) => handleMouseEvent(e, props.onMouseUp)}
      onMouseEnter={(e) => handleMouseEvent(e, props.onMouseEnter)}
      onMouseLeave={(e) => handleMouseEvent(e, props.onMouseLeave)}
      onTouchMove={(e) => handleTouchEvent(e, props.onTouchMove)}
      onTouchStart={(e) => handleTouchEvent(e, props.onTouchStart)}
      onTouchEnd={(e) => handleTouchEvent(e, props.onTouchEnd)}
      style={{ overflow: "hidden", position: "relative" }}
    >
      <canvas ref={canvasRef} style={{ display: "block" }}></canvas>
    </div>
  );

  const canvasRenderer = {
    element,
    scene: props.scene,
    camera: props.camera,
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
          if (props.onResize) {
            props.onResize(
              overlayRef.current.clientWidth,
              overlayRef.current.clientHeight
            );
          }
        }
        if (canvasRef.current && props.onDraw) {
          props.onDraw({
            canvasRenderer,
            width: size.x,
            height: size.y,
            canvas: canvasRef.current,
          });
        }
        renderer.render(props.scene, props.camera);
        if (!disposed) {
          requestAnimationFrame(() => renderLoop());
        }
      };
      requestAnimationFrame(() => renderLoop());
    }
    return () => {
      disposed = true;
    };
  }, [
    canvasRef,
    overlayRef,
    canvasRef.current,
    overlayRef.current,
    renderer,
    props.scene,
    props.camera,
  ]);

  return canvasRenderer;
}
