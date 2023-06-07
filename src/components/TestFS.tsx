import { ReactElement, useMemo } from "react";

import { Vector2 } from "three";

import FragmentShaderView from "@app/components/FragmentShaderView";
import { CanvasOnDrawParams } from "@app/hooks/useCanvasRenderer";

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

  const onDraw = (params: CanvasOnDrawParams): typeof uniforms => {
    uniforms.time.value = params.canvasRenderer.clock.getElapsedTime();
    uniforms.resolution.value = new Vector2(params.width, params.height);
    uniforms.ratio.value = params.width / params.height;
    return uniforms;
  };

  return (
    <FragmentShaderView
      className={props.className}
      onDraw={onDraw}
      fragmentShader={shader}
      uniforms={uniforms}
    />
  );
}
