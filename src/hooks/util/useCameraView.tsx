import { PerspectiveCamera } from "three";

import useCanvasRenderer, {
  CanvasRenderer,
  UseCanvasRendererProps,
} from "@app/hooks/render/useCanvasRenderer";

export interface UseCameraViewProps extends UseCanvasRendererProps {
  autoUpdateAspect: boolean;
}

export default function useCameraView(
  props: UseCameraViewProps
): CanvasRenderer {
  let canvasRenderer: CanvasRenderer | null = null;

  const recalculateCameraAspect = (): void => {
    if (
      canvasRenderer?.overlayRef.current &&
      props.autoUpdateAspect &&
      props.camera instanceof PerspectiveCamera
    ) {
      props.camera.aspect =
        canvasRenderer.overlayRef.current.clientWidth /
        canvasRenderer.overlayRef.current.clientHeight;
      props.camera.updateProjectionMatrix();
    }
  };

  canvasRenderer = useCanvasRenderer({
    ...props,
    onResize: (width: number, height: number) => {
      recalculateCameraAspect();
      if (props.onResize) {
        props.onResize(width, height);
      }
    },
  });

  return canvasRenderer;
}
