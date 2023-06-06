import { ReactElement } from "react";

import * as THREE from "three";
import { Mesh } from "three";

import OrbitCameraView from "@app/components/OrbitCameraView";
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

  const onDraw = (
    _c: THREE.Camera,
    _s: THREE.Scene,
    clock: THREE.Clock
  ): void => {
    scene.getObjectByName("box1")?.rotateZ(clock.getDelta() * 0.63);
  };

  return (
    <OrbitCameraView
      className={props.className}
      scene={scene}
      onDraw={onDraw}
    />
  );
}
