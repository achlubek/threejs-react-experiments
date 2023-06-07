import { ReactElement, useEffect, useMemo, useState } from "react";

import * as THREE from "three";

import { BufferRenderer } from "@app/hooks/useBufferRenderer";
import { CanvasOnDrawParams } from "@app/hooks/useCanvasRenderer";
import useFragmentShaderBuffer from "@app/hooks/useFragmentShaderBuffer";
import useFragmentShaderView from "@app/hooks/useFragmentShaderView";

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

  const [bufferRenderer, setBufferRenderer] = useState<BufferRenderer | null>();

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
    if (bufferRenderer?.texture && bufferRenderer.render) {
      uniforms.tex0.value = bufferRenderer.texture.texture;
      bufferRenderer.render();
    }
    return uniforms;
  };

  const fragmentShaderView = useFragmentShaderView({
    uniforms,
    onDraw,
    fragmentShader: shader,
    elementClassName: props.className,
    onMouseEnter: () => (uniforms.desiredColorMultiplier.value = 1.0),
    onMouseLeave: () => (uniforms.desiredColorMultiplier.value = 0.7),
  });

  const fs = useFragmentShaderBuffer({
    fragmentShader: `
      varying vec2 UV;
      void main() {
        gl_FragColor = vec4(UV.x, UV.y, 1.0, 1.0);
      }`,
    height: 32,
    width: 32,
    renderer: fragmentShaderView.renderer,
  });

  useEffect(() => {
    setBufferRenderer(fs);
    if (fs.texture) {
      uniforms.tex0.value = fs.texture.texture;
    }
  }, [fs.texture]);

  return fragmentShaderView.element;
}
