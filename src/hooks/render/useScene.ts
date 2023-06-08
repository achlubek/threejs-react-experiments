import React, { useEffect, useMemo } from "react";

import * as THREE from "three";

import { disposeScene } from "@app/util/disposeScene";

export const useScene = (
  init: (scene: THREE.Scene) => void,
  deps: React.DependencyList = []
): THREE.Scene => {
  const scene = useMemo(() => new THREE.Scene(), deps);

  useEffect(() => {
    init(scene);
    return () => {
      disposeScene(scene);
    };
  }, deps);

  return scene;
};
