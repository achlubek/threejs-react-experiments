import { ReactElement, useEffect, useMemo, useRef, useState } from "react";

import * as THREE from "three";
import { Matrix4, PerspectiveCamera, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import Canvas from "@app/components/Canvas";

export interface OrbitCameraViewProps {
  className?: string | undefined;
  onDraw: (
    camera: THREE.Camera,
    scene: THREE.Scene,
    clock: THREE.Clock
  ) => void;
  scene: THREE.Scene;
}

export default function OrbitCameraView(
  props: OrbitCameraViewProps
): ReactElement {
  const elementRef = useRef<HTMLDivElement | null>(null);

  const [camera, setCamera] = useState<THREE.Camera>(
    new THREE.PerspectiveCamera()
  );

  const recreateCamera = (): void => {
    const ratio =
      (elementRef.current?.clientWidth ?? 1) /
      (elementRef.current?.clientHeight ?? 1);
    const newCam = new THREE.PerspectiveCamera(90, ratio, 0.01, 100.0);
    newCam.position.y -= 2;
    newCam.lookAt(new Vector3(0, -1, 0));
    setCamera(newCam);
  };

  const recalculateCameraAspect = (): void => {
    const ratio =
      (elementRef.current?.clientWidth ?? 1) /
      (elementRef.current?.clientHeight ?? 1);
    const pcam = camera as PerspectiveCamera;
    pcam.aspect = ratio;
    pcam.updateProjectionMatrix();
  };

  useEffect(() => recreateCamera(), []);

  const controls = useMemo(() => {
    if (elementRef.current) {
      const con = new OrbitControls(camera, elementRef.current);
      con.enableRotate = true;
      con.enablePan = false;
      con.enableZoom = false;
      return con;
    }
    return null;
  }, [elementRef, elementRef.current === null, camera]);

  const onDraw = (
    camera: THREE.Camera,
    scene: THREE.Scene,
    clock: THREE.Clock
  ): void => {
    controls?.update();
    props.onDraw(camera, scene, clock);
  };

  return (
    <Canvas
      className={props.className}
      overlayRef={elementRef}
      scene={props.scene}
      camera={camera}
      onDraw={onDraw}
      onResize={() => recalculateCameraAspect()}
    />
  );
}