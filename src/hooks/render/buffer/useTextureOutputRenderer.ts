import * as THREE from "three";
import { NoToneMapping, Vector4 } from "three";

import { BackBufferRenderer } from "@app/hooks/render/buffer/useBackBufferRenderer";
import { BufferRenderer } from "@app/hooks/render/buffer/useManualRenderTargetRenderer";
import useFullScreenShaderPassArrangement from "@app/hooks/render/useFullScreenShaderPassArrangement";

export interface TextureOutputRendererProps {
  texture: THREE.Texture;
  bufferRenderer: BufferRenderer | BackBufferRenderer;
}

export interface TextureOutputRendererRenderCallParams {
  target: THREE.WebGLRenderTarget | THREE.WebGLMultipleRenderTargets | null;
  viewport?: Vector4 | undefined;
}

export interface TextureOutputRenderer {
  render: (params: TextureOutputRendererRenderCallParams) => void;
  setTexture: (texture: THREE.Texture) => void;
}

export default function useTextureOutputRenderer(
  props: TextureOutputRendererProps
): TextureOutputRenderer {
  const fragmentShader = `
    varying vec2 UV;
    uniform sampler2D tex;
    void main() { gl_FragColor = texture(tex, UV); } `;

  const { scene, camera, setUniforms } = useFullScreenShaderPassArrangement({
    fragmentShader,
    uniforms: {
      tex: {
        value: props.texture,
      },
    },
  });

  const render = (params: TextureOutputRendererRenderCallParams): void => {
    props.bufferRenderer.render({
      ...params,
      camera,
      scene,
      toneMapping: NoToneMapping,
    });
  };

  return {
    render,
    setTexture: (texture: THREE.Texture) =>
      setUniforms({
        tex: {
          value: texture,
        },
      }),
  };
}
