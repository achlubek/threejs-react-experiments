import React, { ReactElement, useEffect, useMemo, useRef } from "react";

import * as THREE from "three";
import { Vector2 } from "three";

import { renderToTarget } from "@app/util/renderToTarget";

export interface CanvasOnDrawParams {
  canvasRenderer: CanvasRenderer;
  width: number;
  height: number;
}

export interface CanvasRendererPosition {
  x: number;
  y: number;
}

export interface CanvasRendererBaseCanvas2DInteractionEventParams {
  position: CanvasRendererPosition;
  intersects: THREE.Intersection[];
  rayDirection: THREE.Vector3;
}

export interface CanvasRendererMouseEventParams
  extends CanvasRendererBaseCanvas2DInteractionEventParams {
  buttons: number;
}

export type UseCanvasRendererMouseEventHandler = (
  event: CanvasRendererMouseEventParams
) => void;

export type TouchEventParams =
  CanvasRendererBaseCanvas2DInteractionEventParams[];

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
  renderer: THREE.WebGLRenderer;
}

export interface UseCanvasRendererProps extends UseCanvasRendererPropsBase {
  camera: THREE.Camera;
  scene: THREE.Scene;
  toneMapping?: THREE.ToneMapping | undefined;
}

export interface CanvasRenderer {
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
  const clock = useMemo(() => new THREE.Clock(), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  useEffect(() => {
    if (overlayRef.current) {
      const threeRenderer = props.renderer;
      threeRenderer.setSize(
        overlayRef.current.clientWidth,
        overlayRef.current.clientHeight
      );
      threeRenderer.toneMapping =
        props.toneMapping ?? THREE.ACESFilmicToneMapping;
      threeRenderer.outputColorSpace = "srgb";
      overlayRef.current.appendChild(threeRenderer.domElement);
      return () => {
        threeRenderer.dispose();
      };
    }
    return undefined;
  }, [overlayRef, overlayRef.current]);

  const calculateNormalizedMouseCoords = (
    clientX: number,
    clientY: number
  ): CanvasRendererPosition => {
    const bbox = props.renderer.domElement.getBoundingClientRect();
    const xAbs = clientX - bbox.left;
    const yAbs = clientY - bbox.top;
    const xNorm = xAbs / bbox.width;
    const yNorm = yAbs / bbox.height;
    return { x: xNorm, y: yNorm };
  };

  const calculateNDCMouseCoords = (
    normalized: CanvasRendererPosition
  ): THREE.Vector2 => {
    const xSnorm = normalized.x * 2 - 1;
    const ySnorm = -normalized.y * 2 + 1;
    return new THREE.Vector2(xSnorm, ySnorm);
  };

  const getIntersections = (pointer: THREE.Vector2): THREE.Intersection[] => {
    raycaster.setFromCamera(pointer, props.camera);
    return raycaster.intersectObjects(props.scene.children);
  };

  const handleMouseEvent = (
    e: React.MouseEvent,
    handler: ((event: CanvasRendererMouseEventParams) => void) | undefined
  ): void => {
    if (handler) {
      e.preventDefault();
      const position = calculateNormalizedMouseCoords(e.clientX, e.clientY);
      const intersects = getIntersections(calculateNDCMouseCoords(position));
      handler({
        position,
        intersects,
        rayDirection: raycaster.ray.direction,
        buttons: e.buttons,
      });
    }
  };

  const handleTouchEvent = (
    e: React.TouchEvent,
    handler: ((event: TouchEventParams) => void) | undefined
  ): void => {
    if (handler) {
      e.preventDefault();
      const touches: CanvasRendererBaseCanvas2DInteractionEventParams[] = [];
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
    />
  );

  const canvasRenderer = {
    element,
    scene: props.scene,
    camera: props.camera,
    clock,
    overlayRef,
  };

  useEffect(() => {
    let disposed = false;
    const renderLoop = (): void => {
      let size = new Vector2(0, 0);
      size = props.renderer.getSize(size);
      if (
        overlayRef.current &&
        (size.x !== overlayRef.current.clientWidth ||
          size.y !== overlayRef.current.clientHeight)
      ) {
        props.renderer.setSize(
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

      if (props.onDraw) {
        props.onDraw({
          canvasRenderer,
          width: size.x,
          height: size.y,
        });
      }

      renderToTarget({
        renderer: props.renderer,
        camera: props.camera,
        scene: props.scene,
        toneMapping: props.toneMapping,
        target: null,
      });

      if (!disposed) {
        requestAnimationFrame(() => renderLoop());
      }
    };
    requestAnimationFrame(() => renderLoop());

    return () => {
      disposed = true;
    };
  }, [overlayRef, overlayRef.current, props.scene, props.camera]);

  return canvasRenderer;
}
