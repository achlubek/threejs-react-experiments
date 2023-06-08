import { ReactElement } from "react";

import * as THREE from "three";

import useFragmentShaderRenderer from "@app/hooks/render/buffer/useFragmentShaderRenderer";
import useManualRenderTargetRenderer from "@app/hooks/render/buffer/useManualRenderTargetRenderer";
import useCanvasRenderer from "@app/hooks/render/canvas/useCanvasRenderer";
import useRenderLoop from "@app/hooks/render/useRenderLoop";
import useRenderer from "@app/hooks/render/useRenderer";

export interface CombinationPipelineTestProps {
  className?: string | undefined;
}
export default function CombinationPipelineTest(
  props: CombinationPipelineTestProps
): ReactElement {
  const renderer = useRenderer();

  const texA = new THREE.WebGLRenderTarget(32, 32, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
  });

  const texB = new THREE.WebGLRenderTarget(32, 32, {
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
        value: texA,
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
        value: texB,
      },
    },
  });

  const view = useCanvasRenderer({
    renderer,
    elementClassName: props.className,
    bufferRenderer,
  });

  const stageA = useFragmentShaderRenderer({
    fragmentShader: `
    varying vec2 UV;
    uniform sampler2D prev;
    void main() { gl_FragColor = vec4(texture(prev, UV).rgb, 1.0); }`,
    bufferRenderer: view,
    uniforms: {
      prev: {
        value: texA,
      },
    },
    onDraw: () => {
      stageR.render({
        target: texA,
      });
      stageG.render({
        target: texB,
      });
      stageB.render({
        target: texA,
      });
      return null;
    },
  });

  useRenderLoop(() => {
    stageR.render({
      target: texA,
    });
    stageG.render({
      target: texB,
    });
    stageB.render({
      target: texA,
    });
    stageA.render({
      target: null,
    });
  });

  return view.element;
}
