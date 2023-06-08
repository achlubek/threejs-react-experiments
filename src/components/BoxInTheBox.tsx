import { ReactElement, useEffect, useMemo, useState } from "react";

import * as THREE from "three";
import {
  ACESFilmicToneMapping,
  Clock,
  Color,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  Vector3,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import bumpMap from "@app/assets/bumpmap.jpg";
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

  useEffect(() => {
    const o3d = scene.getObjectByName("BoxMesh");
    if (
      o3d &&
      o3d instanceof Mesh &&
      o3d.material instanceof MeshPhysicalMaterial
    ) {
      o3d.material.color = new Color(props.color);
    }
  }, [props.color]);

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
    elementProps: {
      onMouseMove: (e) => {
        const boxMesh = scene.getObjectByName("BoxMesh") as Mesh;
        const material = boxMesh.material as MeshPhysicalMaterial;
        const raycast = canvas.raycast(camera, scene, e.clientX, e.clientY);
        if (
          raycast.intersections.map((a) => a.object.name).includes("BoxMesh")
        ) {
          material.color = new THREE.Color("white");
        } else {
          material.color = new THREE.Color(props.color);
        }
      },
      onMouseLeave: () => {
        const boxMesh = scene.getObjectByName("BoxMesh") as Mesh;
        const material = boxMesh.material as MeshPhysicalMaterial;
        material.color = new THREE.Color(props.color);
      },
    },
  });

  const [orbitControls, setOrbitControls] = useState<OrbitControls | null>(
    null
  );

  useEffect(() => {
    if (canvas.overlayRef.current) {
      const con = new OrbitControls(camera, canvas.overlayRef.current);
      con.enableRotate = true;
      con.enablePan = false;
      con.enableZoom = false;
      setOrbitControls(con);
    }
  }, [canvas.overlayRef.current === null]);

  const clock = useMemo(() => new Clock(), []);

  useRenderLoop(() => {
    canvas.update();
    scene.getObjectByName("BoxMesh")?.rotateZ(clock.getDelta() * 0.63);
    orbitControls?.update();
    bufferRenderer.render({
      scene,
      camera,
      toneMapping: ACESFilmicToneMapping,
      target: null,
    });
  }, [
    orbitControls,
    camera,
    canvas,
    canvas.overlayRef,
    canvas.overlayRef.current,
  ]);

  return canvas.element;
}
