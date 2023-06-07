import { MouseEventHandler, ReactElement, useEffect, useMemo } from "react";

import * as THREE from "three";
import { Mesh } from "three";

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

  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  const onDraw = (params: CanvasOnDrawParams): void => {
    scene
      .getObjectByName("BoxMesh")
      ?.rotateZ(params.canvasRenderer.clock.getDelta() * 0.63);
  };

  const orbitCameraView = useOrbitCameraView({
    elementClassName: props.className,
    scene,
    onDraw,
  });
  /*
  useEffect(() => {
    if (orbitCameraView.overlayRef.current) {
      const bbox = orbitCameraView.overlayRef.current.getBoundingClientRect();
      const onClick = (e: MouseEvent) => {
        const xAbs = e.clientX - bbox.left;
        const yAbs = e.clientY - bbox.top;
        const xNorm = xAbs / bbox.width;
        const yNorm = yAbs / bbox.height;
        const xSnorm = xNorm * 2 - 1;
        const ySnorm = -yNorm * 2 + 1;
        const pointer = new THREE.Vector2(xSnorm, ySnorm);
        raycaster.setFromCamera(pointer, orbitCameraView.camera);
        const intersects = raycaster.intersectObjects(
          orbitCameraView.scene.children
        );
        console.log(intersects);
      };
      orbitCameraView.overlayRef.current.addEventListener("click", onClick);
      return () => {
        orbitCameraView.overlayRef.current?.removeEventListener(
          "click",
          onClick
        );
      };
    }
    return undefined;
  }, [orbitCameraView.overlayRef.current]);*/
  const onClickX = (e: React.MouseEvent<HTMLDivElement>) => {
    if (orbitCameraView.overlayRef.current) {
      const bbox = orbitCameraView.overlayRef.current.getBoundingClientRect();
      const xAbs = e.clientX - bbox.left;
      const yAbs = e.clientY - bbox.top;
      const xNorm = xAbs / bbox.width;
      const yNorm = yAbs / bbox.height;
      const xSnorm = xNorm * 2 - 1;
      const ySnorm = -yNorm * 2 + 1;
      const pointer = new THREE.Vector2(xSnorm, ySnorm);
      raycaster.setFromCamera(pointer, orbitCameraView.camera);
      const intersects = raycaster.intersectObjects(
        orbitCameraView.scene.children
      );
      console.log(intersects);
    }
  };

  return <div onClick={(e) => onClickX(e)}>{orbitCameraView.element}</div>;
}
