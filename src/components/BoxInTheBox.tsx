import { MouseEventHandler, ReactElement, useEffect, useMemo } from "react";

import * as THREE from "three";
import { Mesh, MeshPhysicalMaterial } from "three";

import bumpMap from "@app/assets/bumpmap.jpg";
import { CanvasOnDrawParams } from "@app/hooks/useCanvasRenderer";
import useOrbitCameraView from "@app/hooks/useOrbitCameraView";
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

  const onDraw = (params: CanvasOnDrawParams): void => {
    scene
      .getObjectByName("BoxMesh")
      ?.rotateZ(params.canvasRenderer.clock.getDelta() * 0.63);
  };

  const orbitCameraView = useOrbitCameraView({
    elementClassName: props.className,
    scene,
    onDraw,
    onMouseDown: (x: number, y: number, intersects: THREE.Intersection[]) => {
      console.log({ x, y, intersects });
    },
    onMouseMove: (x: number, y: number, intersects: THREE.Intersection[]) => {
      const boxMesh = scene.getObjectByName("BoxMesh") as Mesh;
      const material = boxMesh.material as MeshPhysicalMaterial;
      if (intersects.map((a) => a.object.name).includes("BoxMesh")) {
        material.color = new THREE.Color("white");
      } else {
        material.color = new THREE.Color(props.color);
      }
    },
  });

  return orbitCameraView.element;
}
