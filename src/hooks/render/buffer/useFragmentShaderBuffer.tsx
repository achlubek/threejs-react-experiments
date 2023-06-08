import * as THREE from "three";

import useBufferRenderer, {
  BufferOnDrawParams,
  BufferRenderer,
  UseBufferRendererPropsBase,
} from "@app/hooks/render/buffer/useBufferRenderer";
import useFragmentShader from "@app/hooks/render/useFragmentShader";

export interface CameraViewProps<UniType extends Record<string, THREE.IUniform>>
  extends UseBufferRendererPropsBase {
  onDraw?: ((params: BufferOnDrawParams) => UniType) | undefined;
  fragmentShader: string;
  uniforms?: UniType | undefined;
}

export default function useFragmentShaderBuffer<
  UniType extends Record<string, THREE.IUniform>
>(props: CameraViewProps<UniType>): BufferRenderer {
  const { scene, camera, setUniforms } = useFragmentShader(props);

  const onDraw = (params: BufferOnDrawParams): void => {
    if (props.onDraw) {
      setUniforms(props.onDraw(params));
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
