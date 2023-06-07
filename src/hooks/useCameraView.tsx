import { useRef } from "react";

import { PerspectiveCamera } from "three";

import useCanvasRenderer, {
  CanvasRenderer,
  UseCanvasRendererProps,
} from "@app/hooks/useCanvasRenderer";

export interface UseCameraViewProps extends UseCanvasRendererProps {
  autoUpdateAspect: boolean;
}

export default function useCameraView(
  props: UseCameraViewProps
): CanvasRenderer {
  const elementRef = useRef<HTMLDivElement | null>(null);

  const recalculateCameraAspect = (): void => {
    if (props.autoUpdateAspect && props.camera instanceof PerspectiveCamera) {
      props.camera.aspect =
        (elementRef.current?.clientWidth ?? 1) /
        (elementRef.current?.clientHeight ?? 1);
      props.camera.updateProjectionMatrix();
    }
  };

  return useCanvasRenderer({
    ...props,
    onResize: (width: number, height: number) => {
      recalculateCameraAspect();
      if (props.onResize) {
        props.onResize(width, height);
      }
    },
  });
}
