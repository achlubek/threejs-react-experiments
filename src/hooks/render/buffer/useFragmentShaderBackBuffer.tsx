import * as THREE from "three";

import useBackBufferRenderer, {
  BackBufferRenderer,
  BufferOnDrawParams,
  UseBackBufferRendererPropsBase,
} from "@app/hooks/render/buffer/useBackBufferRenderer";
import useFragmentShader, {
  FragmentShaderProps,
} from "@app/hooks/render/useFragmentShader";

export interface FragmentShaderBackBufferProps<
  UniType extends Record<string, THREE.IUniform>
> extends UseBackBufferRendererPropsBase,
    FragmentShaderProps<UniType> {
  onDraw?: ((params: BufferOnDrawParams) => UniType | null) | undefined;
}

export default function useFragmentShaderBackBuffer<
  UniType extends Record<string, THREE.IUniform>
>(props: FragmentShaderBackBufferProps<UniType>): BackBufferRenderer {
  const { scene, camera, setUniforms } = useFragmentShader(props);

  const onDraw = (params: BufferOnDrawParams): void => {
    if (props.onDraw) {
      const newUnis = props.onDraw(params);
      if (newUnis) {
        setUniforms(newUnis);
      }
    }
  };

  return useBackBufferRenderer({
    ...props,
    scene,
    camera,
    onDraw,
    toneMapping: THREE.NoToneMapping,
  });
}
