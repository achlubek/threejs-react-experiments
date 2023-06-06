import { ReactElement, useMemo } from "react";

import * as THREE from "three";

import { CanvasOnDrawParams } from "@app/components/Canvas";
import FragmentShaderView from "@app/components/FragmentShaderView";

export interface TestFSProps {
  className?: string | undefined;
}
export default function TestFS(props: TestFSProps): ReactElement {
  const shader = `
    varying vec2 UV;
    uniform float time;

    void main() {
      vec4 C = vec4(UV.x, UV.y, sin(time), 1.0);
      gl_FragColor = C;
    }
  `;

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
    }),
    []
  );

  const onDraw = (params: CanvasOnDrawParams): typeof uniforms => {
    uniforms.time.value = params.clock.getElapsedTime();
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
