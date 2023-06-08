import { ReactElement, useMemo } from "react";

import { Clock, Vector2 } from "three";

import useFragmentShaderRenderer from "@app/hooks/render/buffer/useFragmentShaderRenderer";
import useManualRenderTargetRenderer from "@app/hooks/render/buffer/useManualRenderTargetRenderer";
import useCanvas from "@app/hooks/render/canvas/useCanvas";
import useRenderLoop from "@app/hooks/render/useRenderLoop";
import useRenderer from "@app/hooks/render/useRenderer";

export interface TestFSProps {
  className?: string | undefined;
}
export default function TestFS(props: TestFSProps): ReactElement {
  const shader = `
    varying vec2 UV;
    uniform float time;
    uniform vec2 resolution;
    uniform float ratio;

    void main() {
      vec4 C = vec4(UV.x * ratio, UV.y, sin(time), smoothstep(0.0, 0.1, sin(time + UV.x * ratio * 40.0 + UV.y * 100.0)));
      gl_FragColor = C;
    }
  `;

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      resolution: { value: new Vector2(0, 0) },
      ratio: { value: 1 },
    }),
    []
  );

  const clock = useMemo(() => new Clock(), []);

  const renderer = useRenderer();

  const bufferRenderer = useManualRenderTargetRenderer({
    renderer,
  });

  const stage = useFragmentShaderRenderer({
    uniforms,
    fragmentShader: shader,
    bufferRenderer,
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
    stage.setUniforms(uniforms);

    stage.render({
      target: null,
    });
  });

  return canvas.element;
}
