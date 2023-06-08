import * as THREE from "three";
import { NoToneMapping, Vector4 } from "three";

import { BackBufferRenderer } from "@app/hooks/render/buffer/useBackBufferRenderer";
import { BufferRenderer } from "@app/hooks/render/buffer/useManualRenderTargetRenderer";
import { CanvasRenderer } from "@app/hooks/render/canvas/useCanvasRenderer";
import useFragmentShader, {
  FragmentShaderProps,
} from "@app/hooks/render/useFragmentShader";

export interface FragmentShaderBufferProps<
  UniType extends Record<string, THREE.IUniform>
> extends FragmentShaderProps<UniType> {
  bufferRenderer: BufferRenderer | BackBufferRenderer | CanvasRenderer;
  onDraw?: (() => UniType | null) | undefined;
}

export interface FragmentShaderRendererRenderCallParams {
  target: THREE.WebGLRenderTarget | THREE.WebGLMultipleRenderTargets | null;
  viewport?: Vector4 | undefined;
}

export interface FragmentShaderRenderer {
  render: (params: FragmentShaderRendererRenderCallParams) => void;
}

export default function useFragmentShaderRenderer<
  UniType extends Record<string, THREE.IUniform>
>(props: FragmentShaderBufferProps<UniType>): FragmentShaderRenderer {
  const { scene, camera, setUniforms } = useFragmentShader(props);

  const onDraw = (): void => {
    if (props.onDraw) {
      const newUnis = props.onDraw();
      if (newUnis) {
        setUniforms(newUnis);
      }
    }
  };

  const render = (params: FragmentShaderRendererRenderCallParams): void => {
    onDraw();
    props.bufferRenderer.render({
      ...params,
      camera,
      scene,
      toneMapping: NoToneMapping,
    });
  };

  return { render };
}
