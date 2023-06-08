import { useEffect, useMemo, useState } from "react";

import * as THREE from "three";
import { Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import useCameraView from "@app/hooks/render/canvas/useCameraView";
import {
  CanvasOnDrawParams,
  CanvasRenderer,
  UseCanvasRendererPropsBase,
} from "@app/hooks/render/canvas/useCanvasRenderer";

export interface UseOrbitCameraViewProps extends UseCanvasRendererPropsBase {
  scene: THREE.Scene;
}

export default function useOrbitCameraView(
  props: UseOrbitCameraViewProps
): CanvasRenderer {
  const onDraw = (params: CanvasOnDrawParams): void => {
    controls?.update();
    if (props.onDraw) {
      props.onDraw(params);
    }
  };

  const [camera, setCamera] = useState<THREE.Camera>(
    new THREE.PerspectiveCamera()
  );

  const canvasRenderer = useCameraView({
    ...props,
    camera,
    onDraw,
    autoUpdateAspect: true,
  });

  const recreateCamera = (): void => {
    const ratio =
      (canvasRenderer.overlayRef.current?.clientWidth ?? 1) /
      (canvasRenderer.overlayRef.current?.clientHeight ?? 1);
    const newCam = new THREE.PerspectiveCamera(90, ratio, 0.01, 100.0);
    newCam.position.y -= 2;
    newCam.lookAt(new Vector3(0, -1, 0));
    setCamera(newCam);
  };

  useEffect(() => recreateCamera(), []);
  const controls = useMemo(() => {
    if (canvasRenderer.overlayRef.current) {
      const con = new OrbitControls(
        canvasRenderer.camera,
        canvasRenderer.overlayRef.current
      );
      con.enableRotate = true;
      con.enablePan = false;
      con.enableZoom = false;
      return con;
    }
    return null;
  }, [canvasRenderer.overlayRef, canvasRenderer.overlayRef.current, camera]);

  return canvasRenderer;
}
