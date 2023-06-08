import * as THREE from "three";

import useCanvasRenderer, {
  CanvasOnDrawParams,
  CanvasRenderer,
  UseCanvasRendererPropsBase,
} from "@app/hooks/render/canvas/useCanvasRenderer";
import useFragmentShader from "@app/hooks/render/useFragmentShader";

export interface FragmentShaderViewProps<
  UniType extends Record<string, THREE.IUniform>
> extends UseCanvasRendererPropsBase {
  onDraw?: ((params: CanvasOnDrawParams) => UniType) | undefined;
  fragmentShader: string;
  uniforms?: UniType | undefined;
}

export default function useFragmentShaderView<
  UniType extends Record<string, THREE.IUniform>
>(props: FragmentShaderViewProps<UniType>): CanvasRenderer {
  const { scene, camera, setUniforms } = useFragmentShader(props);

  const onDraw = (params: CanvasOnDrawParams): void => {
    if (props.onDraw) {
      setUniforms(props.onDraw(params));
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
