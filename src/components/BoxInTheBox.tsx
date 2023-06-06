import { ReactElement, useEffect, useMemo, useRef, useState } from "react";

import styled from "styled-components";
import * as THREE from "three";
import { Mesh, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import Canvas from "@app/components/Canvas";
import { useScene } from "@app/hooks/useScene";

export interface BoxInTheBoxProps {
  color: THREE.ColorRepresentation;
  className?: string | undefined;
}

export default function BoxInTheBox(props: BoxInTheBoxProps): ReactElement {
  const scene = useScene((scene: THREE.Scene) => {
    const boxGeo = new THREE.BoxGeometry();
    const boxMat = new THREE.MeshPhysicalMaterial({ color: props.color });
    const box = new Mesh(boxGeo, boxMat);
    box.name = "box1";
    scene.add(box);
    scene.add(
      new THREE.PointLight("white", 12.0, 11, 0).translateZ(5.0).translateX(5.0)
    );
    scene.add(new THREE.AmbientLight("white", 0.2));
  });

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
    _c: THREE.Camera,
    _s: THREE.Scene,
    clock: THREE.Clock
  ): void => {
    //  box.rotateX(clock.getDelta());
    //   box.rotateY(clock.getDelta() * 0.23);
    scene.getObjectByName("box1")?.rotateZ(clock.getDelta() * 0.63);
    controls?.update();
  };

  return (
    <StyledCanvas
      className={props.className}
      overlayRef={elementRef}
      scene={scene}
      camera={camera}
      onDraw={onDraw}
      onResize={() => recreateCamera()}
    />
  );
}

const StyledCanvas = styled(Canvas)``;
