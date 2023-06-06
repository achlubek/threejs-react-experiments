import * as THREE from "three";

export function disposeObject3d(o3d: object): void {
  const disposeIfPossible = (target: object): void => {
    const v = target as {
      dispose: unknown;
      userData?: { noDispose?: boolean };
    };
    if (
      v.dispose &&
      typeof v.dispose === "function" &&
      !v.userData?.noDispose
    ) {
      v.dispose();
    }
  };
  Object.keys(o3d).forEach((key) => {
    const v = o3d[key] as unknown | unknown[];
    if (Array.isArray(v)) {
      v.map((a) => {
        disposeIfPossible(a as object);
      });
    }
    if (typeof v === "object") {
      disposeObject3d(v!);
      disposeIfPossible(v!);
    }
  });
}

export function disposeScene(scene: THREE.Scene): void {
  scene.children.forEach((c) => {
    if (!c.userData.noDispose) {
      if (c instanceof THREE.Scene) {
        disposeScene(c);
      } else {
        disposeObject3d(c);
      }
    }
  });
  scene.clear();
}
