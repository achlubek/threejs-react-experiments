import { useRef } from "react";

import * as THREE from "three";
import { PerspectiveCamera } from "three";

import useCanvasRenderer, {
  CanvasOnDrawParams,
  CanvasRenderer,
} from "@app/hooks/useCanvasRenderer";

export interface CameraViewProps {
  elementClassName?: string | undefined;
  onDraw: (params: CanvasOnDrawParams) => void;
  scene: THREE.Scene;
  camera: THREE.Camera;
  autoUpdateAspect: boolean;
}

export default function useCameraView(props: CameraViewProps): CanvasRenderer {
  const elementRef = useRef<HTMLDivElement | null>(null);

  const recalculateCameraAspect = (): void => {
    if (props.autoUpdateAspect && props.camera instanceof PerspectiveCamera) {
      props.camera.aspect =
        (elementRef.current?.clientWidth ?? 1) /
        (elementRef.current?.clientHeight ?? 1);
      props.camera.updateProjectionMatrix();
    }
  };

  return useCanvasRenderer({
    elementClassName: props.elementClassName,
    overlayRef: elementRef,
    scene: props.scene,
    camera: props.camera,
    onDraw: props.onDraw,
    onResize: () => recalculateCameraAspect(),
  });
}
