import { ReactElement } from "react";

import * as THREE from "three";

import useFragmentShaderRenderer from "@app/hooks/render/buffer/useFragmentShaderRenderer";
import useManualRenderTargetRenderer from "@app/hooks/render/buffer/useManualRenderTargetRenderer";
import useCanvas from "@app/hooks/render/canvas/useCanvas";
import useRenderLoop from "@app/hooks/render/useRenderLoop";
import useRenderer from "@app/hooks/render/useRenderer";

export interface CombinationPipelineTestProps {
  className?: string | undefined;
}
export default function CombinationPipelineTest(
  props: CombinationPipelineTestProps
): ReactElement {
  const renderer = useRenderer();

  const tex1 = new THREE.WebGLRenderTarget(32, 32, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
  });

  const tex2 = new THREE.WebGLRenderTarget(32, 32, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
  });

  const bufferRenderer = useManualRenderTargetRenderer({
    renderer,
  });

  const stageR = useFragmentShaderRenderer({
    fragmentShader: `void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }`,
    bufferRenderer,
  });

  const stageG = useFragmentShaderRenderer({
    fragmentShader: `
    varying vec2 UV;
    uniform sampler2D prev;
    void main() { gl_FragColor = vec4(texture(prev, UV).rgb + vec3(0.0, 1.0, 0.0), 1.0); }`,
    bufferRenderer,
    uniforms: {
      prev: {
        value: tex1,
      },
    },
  });

  const stageB = useFragmentShaderRenderer({
    fragmentShader: `
    varying vec2 UV;
    uniform sampler2D prev;
    void main() { gl_FragColor = vec4(texture(prev, UV).rgb + vec3(0.0, 0.0, 1.0), 1.0); }`,
    bufferRenderer,
    uniforms: {
      prev: {
        value: tex2,
      },
    },
  });

  const stageA = useFragmentShaderRenderer({
    fragmentShader: `
    varying vec2 UV;
    uniform sampler2D prev;
    void main() { gl_FragColor = vec4(texture(prev, UV).rgb, 1.0); }`,
    bufferRenderer,
    uniforms: {
      prev: {
        value: tex1,
      },
    },
  });

  const canvas = useCanvas({
    renderer,
    elementClassName: props.className,
  });

  useRenderLoop(() => {
    canvas.update();
    stageR.render({
      target: tex1,
    });
    stageG.render({
      target: tex2,
    });
    stageB.render({
      target: tex1,
    });
    stageA.render({
      target: null,
    });
  });

  return canvas.element;
}
