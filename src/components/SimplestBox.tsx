import { ReactElement, useMemo } from "react";

import * as THREE from "three";
import { ACESFilmicToneMapping, Mesh, PerspectiveCamera, Vector3 } from "three";

import useManualRenderTargetRenderer from "@app/hooks/render/buffer/useManualRenderTargetRenderer";
import useCanvas from "@app/hooks/render/canvas/useCanvas";
import useRenderLoop from "@app/hooks/render/useRenderLoop";
import useRenderer from "@app/hooks/render/useRenderer";
import { useScene } from "@app/hooks/render/useScene";
import { updateCameraAspectRatio } from "@app/util/updateCameraAspectRatio";

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

  const renderer = useRenderer();

  const bufferRenderer = useManualRenderTargetRenderer({
    renderer,
  });

  const camera = useMemo(() => {
    const c = new PerspectiveCamera(65, 1, 0.01, 100.0);
    c.position.y -= 2;
    c.lookAt(new Vector3(0, -1, 0));
    return c;
  }, []);

  const canvas = useCanvas({
    renderer,
    elementClassName: props.className,
    onResize: () => {
      if (canvas.overlayRef.current) {
        updateCameraAspectRatio(camera, canvas.overlayRef.current);
      }
    },
  });

  useRenderLoop(() => {
    canvas.update();

    bufferRenderer.render({
      scene,
      camera,
      toneMapping: ACESFilmicToneMapping,
      target: null,
    });
  }, [camera, canvas, canvas.overlayRef, canvas.overlayRef.current]);

  return canvas.element;
}
