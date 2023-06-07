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

export interface UseCanvasRendererEvents {
  onDraw?: ((params: CanvasOnDrawParams) => void) | undefined;
  onResize?: ((width: number, height: number) => void) | undefined;
  onMouseMove?:
    | ((x: number, y: number, intersects: THREE.Intersection[]) => void)
    | undefined;
  onMouseDown?:
    | ((x: number, y: number, intersects: THREE.Intersection[]) => void)
    | undefined;
  onMouseUp?:
    | ((x: number, y: number, intersects: THREE.Intersection[]) => void)
    | undefined;
}

export interface UseCanvasRendererPropsBase extends UseCanvasRendererEvents {
  elementClassName?: string | undefined;
}

export interface UseCanvasRendererProps extends UseCanvasRendererPropsBase {
  camera: THREE.Camera;
  scene: THREE.Scene;
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

  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  const calculateNormalizedMouseCoords = (
    clientX: number,
    clientY: number
  ): { x: number; y: number } => {
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

  const calculateNDCMouseCoords = (normalized: {
    x: number;
    y: number;
  }): THREE.Vector2 => {
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

  const onMouseMove = (e: React.MouseEvent): void => {
    e.preventDefault();
    if (canvasRef.current && props.onMouseMove) {
      const norm = calculateNormalizedMouseCoords(e.clientX, e.clientY);
      const intersects = getIntersections(calculateNDCMouseCoords(norm));
      props.onMouseMove(norm.x, norm.y, intersects);
    }
  };

  const onMouseDown = (e: React.MouseEvent): void => {
    e.preventDefault();
    if (canvasRef.current && props.onMouseDown) {
      const norm = calculateNormalizedMouseCoords(e.clientX, e.clientY);
      const intersects = getIntersections(calculateNDCMouseCoords(norm));
      props.onMouseDown(norm.x, norm.y, intersects);
    }
  };

  const onMouseUp = (e: React.MouseEvent): void => {
    e.preventDefault();
    if (canvasRef.current && props.onMouseUp) {
      const norm = calculateNormalizedMouseCoords(e.clientX, e.clientY);
      const intersects = getIntersections(calculateNDCMouseCoords(norm));
      props.onMouseUp(norm.x, norm.y, intersects);
    }
  };

  const onTouchMove = (e: React.TouchEvent): void => {
    e.preventDefault();
    if (e.touches.length > 0 && canvasRef.current && props.onMouseMove) {
      const t = e.touches.item(0);
      const norm = calculateNormalizedMouseCoords(t.clientX, t.clientY);
      const intersects = getIntersections(calculateNDCMouseCoords(norm));
      props.onMouseMove(norm.x, norm.y, intersects);
    }
  };

  const onTouchStart = (e: React.TouchEvent): void => {
    e.preventDefault();
    if (e.touches.length > 0 && canvasRef.current && props.onMouseDown) {
      const t = e.touches.item(0);
      const norm = calculateNormalizedMouseCoords(t.clientX, t.clientY);
      const intersects = getIntersections(calculateNDCMouseCoords(norm));
      props.onMouseDown(norm.x, norm.y, intersects);
    }
  };

  const onTouchEnd = (e: React.TouchEvent): void => {
    e.preventDefault();
    if (e.touches.length > 0 && canvasRef.current && props.onMouseUp) {
      const t = e.touches.item(0);
      const norm = calculateNormalizedMouseCoords(t.clientX, t.clientY);
      const intersects = getIntersections(calculateNDCMouseCoords(norm));
      props.onMouseUp(norm.x, norm.y, intersects);
    }
  };

  const element = (
    <div
      ref={overlayRef}
      className={props.elementClassName}
      onMouseMove={onMouseMove}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchMove={onTouchMove}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
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
        renderer.render(props.scene, props.camera);
        if (canvasRef.current && props.onDraw) {
          props.onDraw({
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
  }, [canvasRef, overlayRef, renderer, props.scene, props.camera]);

  return canvasRenderer;
}
