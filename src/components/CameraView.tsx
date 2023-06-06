import { ReactElement, useRef } from "react";

import * as THREE from "three";
import { PerspectiveCamera } from "three";

import Canvas, { CanvasOnDrawParams } from "@app/components/Canvas";

export interface CameraViewProps {
  className?: string | undefined;
  onDraw: (params: CanvasOnDrawParams) => void;
  scene: THREE.Scene;
  camera: THREE.Camera;
  autoUpdateAspect: boolean;
}

export default function CameraView(props: CameraViewProps): ReactElement {
  const elementRef = useRef<HTMLDivElement | null>(null);

  const recalculateCameraAspect = (): void => {
    if (props.autoUpdateAspect && props.camera instanceof PerspectiveCamera) {
      const ratio =
        (elementRef.current?.clientWidth ?? 1) /
        (elementRef.current?.clientHeight ?? 1);
      props.camera.aspect = ratio;
      props.camera.updateProjectionMatrix();
    }
  };

  return (
    <Canvas
      className={props.className}
      overlayRef={elementRef}
      scene={props.scene}
      camera={props.camera}
      onDraw={props.onDraw}
      onResize={() => recalculateCameraAspect()}
    />
  );
}
