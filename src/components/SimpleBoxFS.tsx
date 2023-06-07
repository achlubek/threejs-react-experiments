import { ReactElement, useMemo } from "react";

import { Vector2 } from "three";

import { CanvasOnDrawParams } from "@app/hooks/useCanvasRenderer";
import useFragmentShaderView from "@app/hooks/useFragmentShaderView";

export interface SimpleBoxFSProps {
  className?: string | undefined;
}
export default function SimpleBoxFS(props: SimpleBoxFSProps): ReactElement {
  const shader = `
  uniform float colorMultiplier;

  void main() {
      gl_FragColor = vec4(vec3(1.0, 0.5, 0.4) * colorMultiplier, 1.0);
    }`;

  const uniforms = useMemo(
    () => ({
      colorMultiplier: { value: 0.7 },
      desiredColorMultiplier: { value: 0.7 },
    }),
    []
  );

  const onDraw = (_params: CanvasOnDrawParams): typeof uniforms => {
    uniforms.colorMultiplier.value =
      uniforms.colorMultiplier.value * 0.8 +
      uniforms.desiredColorMultiplier.value * 0.2;
    return uniforms;
  };

  const fragmentShaderView = useFragmentShaderView({
    uniforms,
    onDraw,
    fragmentShader: shader,
    elementClassName: props.className,
    onMouseEnter: () => {
      uniforms.desiredColorMultiplier.value = 1.0;
      console.log("yey");
    },
    onMouseLeave: () => (uniforms.desiredColorMultiplier.value = 0.7),
  });

  return fragmentShaderView.element;
}
