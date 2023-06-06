import { useEffect, useState } from "react";

import * as THREE from "three";

import { disposeScene } from "@app/util/disposeScene";

export const useScene = (init: (scene: THREE.Scene) => void): THREE.Scene => {
  const [scene, setScene] = useState<THREE.Scene>(() => new THREE.Scene());

  useEffect(() => {
    const s = new THREE.Scene();
    init(s);
    setScene(s);
    return () => {
      disposeScene(s);
      setScene(new THREE.Scene());
    };
  }, []);

  return scene;
};
