import { ReactElement } from "react";

import * as THREE from "three";
import { Mesh } from "three";

import bumpMap from "@app/assets/bumpmap.jpg";
import OrbitCameraView from "@app/components/OrbitCameraView";
import { useScene } from "@app/hooks/useScene";

export interface BoxInTheBoxProps {
  color: THREE.ColorRepresentation;
  className?: string | undefined;
}

export default function BoxInTheBox(props: BoxInTheBoxProps): ReactElement {
  const scene = useScene((scene: THREE.Scene) => {
    const boxGeo = new THREE.BoxGeometry();
    boxGeo.name = "BoxGeo";

    const tex = new THREE.TextureLoader().load(bumpMap);
    tex.name = "BumpTex";

    const boxMat = new THREE.MeshPhysicalMaterial({
      color: props.color,
      roughnessMap: tex,
    });
    boxMat.name = "BoxMat";

    const box = new Mesh(boxGeo, boxMat);
    box.name = "BoxMesh";
    scene.add(box);

    const pointLight = new THREE.PointLight("white", 12.0, 11, 0)
      .translateZ(5.0)
      .translateX(5.0);
    pointLight.name = "PointLight";
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight("white", 0.2);
    ambientLight.name = "AmbientLight";
    scene.add(ambientLight);
  });

  const onDraw = (
    _c: THREE.Camera,
    _s: THREE.Scene,
    clock: THREE.Clock
  ): void => {
    scene.getObjectByName("BoxMesh")?.rotateZ(clock.getDelta() * 0.63);
  };

  return (
    <OrbitCameraView
      className={props.className}
      scene={scene}
      onDraw={onDraw}
    />
  );
}
