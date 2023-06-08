import { ReactElement, useMemo } from "react";

import { Clock, Vector2 } from "three";

import useBackBufferHelper from "@app/hooks/render/helpers/useBackBufferHelper";
import useFullScreenShaderPassHelper from "@app/hooks/render/helpers/useFullScreenShaderPassHelper";
import useTextureOutputHelper from "@app/hooks/render/helpers/useTextureOutputHelper";
import useCanvas from "@app/hooks/render/useCanvas";
import useRender from "@app/hooks/render/useRender";
import useRenderLoop from "@app/hooks/render/useRenderLoop";
import useThreeRenderer from "@app/hooks/render/useThreeRenderer";

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

  const renderer = useThreeRenderer();

  const render = useRender({
    renderer,
  });

  const backRenderer = useBackBufferHelper({
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

  const stage = useFullScreenShaderPassHelper({
    uniforms,
    fragmentShader: shader,
  });

  const output = useTextureOutputHelper({
    render,
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

    render({
      target: backRenderer.getTarget(),
      scene: stage.scene,
      camera: stage.camera,
    });
    backRenderer.toggleState();

    render({
      target: null,
      scene: output.scene,
      camera: output.camera,
    });
  });

  return canvas.element;
}
