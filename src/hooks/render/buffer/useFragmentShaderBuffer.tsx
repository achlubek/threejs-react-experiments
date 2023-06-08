import * as THREE from "three";

import useBufferRenderer, {
  BufferOnDrawParams,
  BufferRenderer,
  UseBufferRendererPropsBase,
} from "@app/hooks/render/buffer/useBufferRenderer";
import useFragmentShader, {
  FragmentShaderProps,
} from "@app/hooks/render/useFragmentShader";

export interface FragmentShaderBufferProps<
  UniType extends Record<string, THREE.IUniform>
> extends UseBufferRendererPropsBase,
    FragmentShaderProps<UniType> {
  onDraw?: ((params: BufferOnDrawParams) => UniType | null) | undefined;
}

export default function useFragmentShaderBuffer<
  UniType extends Record<string, THREE.IUniform>
>(props: FragmentShaderBufferProps<UniType>): BufferRenderer {
  const { scene, camera, setUniforms } = useFragmentShader(props);

  const onDraw = (params: BufferOnDrawParams): void => {
    if (props.onDraw) {
      const newUnis = props.onDraw(params);
      if (newUnis) {
        setUniforms(newUnis);
      }
    }
  };

  return useBufferRenderer({
    ...props,
    scene,
    camera,
    onDraw,
    toneMapping: THREE.NoToneMapping,
  });
}
