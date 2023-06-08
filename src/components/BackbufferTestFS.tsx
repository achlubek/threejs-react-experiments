import { ReactElement, useMemo } from "react";

import { Clock, Vector2 } from "three";

import useBackBufferRenderer from "@app/hooks/render/buffer/useBackBufferRenderer";
import useFragmentShaderRenderer from "@app/hooks/render/buffer/useFragmentShaderRenderer";
import useManualRenderTargetRenderer from "@app/hooks/render/buffer/useManualRenderTargetRenderer";
import useTextureOutputRenderer from "@app/hooks/render/buffer/useTextureOutputRenderer";
import useCanvas from "@app/hooks/render/canvas/useCanvas";
import useRenderLoop from "@app/hooks/render/useRenderLoop";
import useRenderer from "@app/hooks/render/useRenderer";

export interface BackbufferTestFSProps {
  className?: string | undefined;
}
export default function BackbufferTestFS(
  props: BackbufferTestFSProps
): ReactElement {
  const shader = `
    varying vec2 UV;
    uniform float time;
    uniform vec2 resolution;
    uniform float ratio;
    uniform sampler2D bb;

    void main() {
      vec4 C = vec4(
        UV.x * ratio,
        UV.y,
        sin(time),
        smoothstep(0.0, 0.1, sin(time * 10.0 + UV.x * ratio * 40.0 + UV.y * 100.0)));
      gl_FragColor = mix(C, texture2D(bb, UV).rgba, 0.7);
    }
  `;

  const clock = useMemo(() => new Clock(), []);

  const renderer = useRenderer();

  const bufferRenderer = useManualRenderTargetRenderer({
    renderer,
  });

  const backRenderer = useBackBufferRenderer({
    renderer,
    height: 1024,
    width: 1024,
  });

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      resolution: { value: new Vector2(0, 0) },
      ratio: { value: 1 },
      bb: { value: backRenderer.getBackBuffer().texture },
    }),
    []
  );

  const stage = useFragmentShaderRenderer({
    uniforms,
    fragmentShader: shader,
    bufferRenderer: backRenderer,
  });

  const output = useTextureOutputRenderer({
    bufferRenderer,
    texture: backRenderer.getBackBuffer().texture,
  });

  const canvas = useCanvas({
    renderer,
    elementClassName: props.className,
  });

  useRenderLoop(() => {
    canvas.update();
    uniforms.time.value = clock.getElapsedTime();
    const canvasSize = renderer.getSize(new Vector2());
    uniforms.resolution.value = new Vector2(canvasSize.x, canvasSize.y);
    uniforms.ratio.value = canvasSize.x / canvasSize.y;
    uniforms.bb.value = backRenderer.getBackBuffer().texture;
    stage.setUniforms(uniforms);

    stage.render({
      target: null,
    });

    output.render({
      target: null,
    });
  });

  return canvas.element;
}
