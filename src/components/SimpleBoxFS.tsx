import { ReactElement, useCallback, useEffect, useMemo, useState } from "react";

import * as THREE from "three";

import {
  BufferOnDrawParams,
  BufferRenderer,
} from "@app/hooks/useBufferRenderer";
import { CanvasOnDrawParams } from "@app/hooks/useCanvasRenderer";
import useFragmentShaderBuffer from "@app/hooks/useFragmentShaderBuffer";
import useFragmentShaderView from "@app/hooks/useFragmentShaderView";
import useRenderer from "@app/hooks/useRenderer";

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
    }),
    []
  );

  const onDrawBuffer = (params: BufferOnDrawParams): typeof uniformsBuffer => {
    uniformsBuffer.time.value = params.clock.getElapsedTime();
    return uniformsBuffer;
  };

  const bufferRenderer = useFragmentShaderBuffer({
    fragmentShader: `
      varying vec2 UV;
      uniform float time;
      void main() {
        gl_FragColor = vec4(UV.x, sin(UV.y * 10.0 + time), 1.0, 1.0);
      }`,
    height: 32,
    width: 32,
    renderer: renderer.renderer,
    onDraw: onDrawBuffer,
    uniforms: uniformsBuffer,
  });

  const tmp = useMemo<{ render: () => void }>(
    () => ({
      render: () => {
        /**/
      },
    }),
    []
  );

  const uniforms = useMemo(
    () => ({
      colorMultiplier: { value: 0.7 },
      desiredColorMultiplier: { value: 0.7 },
      tex0: { value: new THREE.Texture() }, // ah yes
    }),
    []
  );

  const onDraw = (_params: CanvasOnDrawParams): typeof uniforms => {
    uniforms.colorMultiplier.value =
      uniforms.colorMultiplier.value * 0.8 +
      uniforms.desiredColorMultiplier.value * 0.2;
    console.log("AKECK onDraw");
    console.log(bufferRenderer);
    bufferRenderer.render();
    return uniforms;
  };

  const fragmentShaderView = useFragmentShaderView({
    renderer: renderer.renderer,
    uniforms,
    onDraw,
    fragmentShader: shader,
    elementClassName: props.className,
    onMouseEnter: () => (uniforms.desiredColorMultiplier.value = 1.0),
    onMouseLeave: () => (uniforms.desiredColorMultiplier.value = 0.7),
  });

  useEffect(() => {
    console.log("Setting buffer renderer");
    if (bufferRenderer.texture) {
      uniforms.tex0.value = bufferRenderer.texture.texture;
    }
  }, [bufferRenderer.texture]);

  return fragmentShaderView.element;
}
