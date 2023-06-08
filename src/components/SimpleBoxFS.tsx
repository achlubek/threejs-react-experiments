import { ReactElement, useMemo } from "react";

import { Texture } from "three";

import { BufferOnDrawParams } from "@app/hooks/render/buffer/useBufferRenderer";
import useFragmentShaderBackBuffer from "@app/hooks/render/buffer/useFragmentShaderBackBuffer";
import useFragmentShaderBuffer from "@app/hooks/render/buffer/useFragmentShaderBuffer";
import { CanvasOnDrawParams } from "@app/hooks/render/canvas/useCanvasRenderer";
import useFragmentShaderView from "@app/hooks/render/canvas/useFragmentShaderView";
import useRenderer from "@app/hooks/render/useRenderer";

export interface SimpleBoxFSProps {
  className?: string | undefined;
}
export default function SimpleBoxFS(props: SimpleBoxFSProps): ReactElement {
  const shader = `
  varying vec2 UV;
  uniform float colorMultiplier;
  uniform sampler2D tex0;

  void main() {
      if(UV.x < 0.5){
        gl_FragColor = vec4(texture2D(tex0, UV).rgb, 1.0);
      } else {
        gl_FragColor = vec4(vec3(1.0, 0.5, 0.4) * colorMultiplier, 1.0);
      }
    }`;
  const renderer = useRenderer();

  const uniformsBuffer = useMemo(
    () => ({
      time: { value: 0.0 },
      buttons: { value: 0 },
      tex0: { value: new Texture() },
    }),
    []
  );

  const onDrawBuffer = (params: BufferOnDrawParams): typeof uniformsBuffer => {
    uniformsBuffer.time.value = params.clock.getElapsedTime();
    return uniformsBuffer;
  };

  const bufferRenderer = useFragmentShaderBackBuffer({
    fragmentShader: `
      varying vec2 UV;
      uniform float time;
      uniform float buttons;
      uniform sampler2D tex0;

      void main() {
        vec3 back = texture(tex0, UV).rgb;
        vec3 now = vec3(UV.x, step(0.5, sin(UV.y * (110.0 + buttons * 10.0) + time)), 1.0);
        gl_FragColor = vec4(mix(now, back, 0.9), 1.0);
      }`,
    height: 32,
    width: 32,
    renderer,
    onDraw: onDrawBuffer,
    uniforms: uniformsBuffer,
  });

  const uniforms = useMemo(
    () => ({
      colorMultiplier: { value: 0.7 },
      desiredColorMultiplier: { value: 0.7 },
      tex0: { value: bufferRenderer.getBackBuffer().texture },
    }),
    []
  );

  const onDraw = (_params: CanvasOnDrawParams): typeof uniforms => {
    uniforms.colorMultiplier.value =
      uniforms.colorMultiplier.value * 0.8 +
      uniforms.desiredColorMultiplier.value * 0.2;

    uniformsBuffer.tex0.value = bufferRenderer.getBackBuffer().texture;

    bufferRenderer.render();
    return uniforms;
  };

  const fragmentShaderView = useFragmentShaderView({
    renderer,
    uniforms,
    onDraw,
    fragmentShader: shader,
    elementClassName: props.className,
    onMouseEnter: () => (uniforms.desiredColorMultiplier.value = 1.0),
    onMouseLeave: () => (uniforms.desiredColorMultiplier.value = 0.7),
    onMouseMove: (params) => (uniformsBuffer.buttons.value = params.buttons),
  });

  return fragmentShaderView.element;
}
