import * as THREE from "three";

import useCanvasRenderer, {
  CanvasOnDrawParams,
  CanvasRenderer,
  UseCanvasRendererPropsBase,
} from "@app/hooks/render/canvas/useCanvasRenderer";
import useFragmentShader, {
  FragmentShaderProps,
} from "@app/hooks/render/useFragmentShader";

export interface FragmentShaderViewProps<
  UniType extends Record<string, THREE.IUniform>
> extends UseCanvasRendererPropsBase,
    FragmentShaderProps<UniType> {
  onDraw?: ((params: CanvasOnDrawParams) => UniType | null) | undefined;
}

export default function useFragmentShaderView<
  UniType extends Record<string, THREE.IUniform>
>(props: FragmentShaderViewProps<UniType>): CanvasRenderer {
  const { scene, camera, setUniforms } = useFragmentShader(props);

  const onDraw = (params: CanvasOnDrawParams): void => {
    if (props.onDraw) {
      const newUnis = props.onDraw(params);
      if (newUnis) {
        setUniforms(newUnis);
      }
    }
  };

  return useCanvasRenderer({
    ...props,
    elementClassName: props.elementClassName,
    scene,
    camera,
    onDraw,
    toneMapping: THREE.NoToneMapping,
  });
}
