import { ReactElement, useMemo } from "react";

import { ACESFilmicToneMapping, Clock, Vector2 } from "three";

import useManualRenderTargetRenderer from "@app/hooks/render/buffer/useManualRenderTargetRenderer";
import useCanvasRenderer from "@app/hooks/render/canvas/useCanvasRenderer";
import useFragmentShader from "@app/hooks/render/useFragmentShader";
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

  const { scene, camera, setUniforms } = useFragmentShader({
    uniforms,
    fragmentShader: shader,
  });

  const onDraw = (): void => {
    uniforms.time.value = clock.getElapsedTime();
    const canvasSize = renderer.getSize(new Vector2());
    uniforms.resolution.value = new Vector2(canvasSize.x, canvasSize.y);
    uniforms.ratio.value = canvasSize.x / canvasSize.y;
    setUniforms(uniforms);
  };

  const bufferRenderer = useManualRenderTargetRenderer({
    renderer,
  });

  const view = useCanvasRenderer({
    renderer,
    onDraw,
    elementClassName: props.className,
    bufferRenderer,
  });

  useRenderLoop(() => {
    view.render({
      scene,
      camera,
      toneMapping: ACESFilmicToneMapping,
    });
  });

  return view.element;
}
