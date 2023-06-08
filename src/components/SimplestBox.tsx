import { ReactElement, useMemo } from "react";

import * as THREE from "three";
import { Mesh, PerspectiveCamera, Vector3 } from "three";

import useCanvasRenderLoopHelper from "@app/hooks/render/helpers/useCanvasRenderLoopHelper";
import { useScene } from "@app/hooks/render/useScene";

export interface BoxInTheBoxProps {
  color: THREE.ColorRepresentation;
  className?: string | undefined;
}

export default function SimplestBox(props: BoxInTheBoxProps): ReactElement {
  const scene = useScene((scene: THREE.Scene) => {
    const boxGeo = new THREE.BoxGeometry();
    boxGeo.name = "BoxGeo";

    const boxMat = new THREE.MeshPhysicalMaterial({
      color: props.color,
    });
    boxMat.name = "BoxMat";

    const box = new Mesh(boxGeo, boxMat);
    box.name = "BoxMesh";
    scene.add(box);

    const ambientLight = new THREE.AmbientLight("white", 0.2);
    ambientLight.name = "AmbientLight";
    scene.add(ambientLight);
  });

  const camera = useMemo(() => {
    const c = new PerspectiveCamera(65, 1, 0.01, 100.0);
    c.position.y -= 2;
    c.lookAt(new Vector3(0, -1, 0));
    return c;
  }, []);

  const helper = useCanvasRenderLoopHelper({
    scene,
    camera,
    autoCorrectAspect: true,
    className: props.className,
  });

  return helper.canvas.element;
}
