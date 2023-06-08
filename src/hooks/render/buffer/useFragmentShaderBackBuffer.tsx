import * as THREE from "three";

import useBackBufferRenderer, {
  BackBufferRenderer,
  BufferOnDrawParams,
  UseBackBufferRendererPropsBase,
} from "@app/hooks/render/buffer/useBackBufferRenderer";
import useFragmentShader from "@app/hooks/render/useFragmentShader";

export interface FragmentShaderBackBufferProps<
  UniType extends Record<string, THREE.IUniform>
> extends UseBackBufferRendererPropsBase {
  onDraw?: ((params: BufferOnDrawParams) => UniType) | undefined;
  fragmentShader: string;
  uniforms?: UniType | undefined;
}

export default function useFragmentShaderBackBuffer<
  UniType extends Record<string, THREE.IUniform>
>(props: FragmentShaderBackBufferProps<UniType>): BackBufferRenderer {
  const { scene, camera, setUniforms } = useFragmentShader(props);

  const onDraw = (params: BufferOnDrawParams): void => {
    if (props.onDraw) {
      setUniforms(props.onDraw(params));
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
