import { ReactElement, useEffect, useMemo } from "react";

import * as THREE from "three";

import useFullScreenShaderPassHelper from "@app/hooks/render/helpers/useFullScreenShaderPassHelper";
import useCanvas from "@app/hooks/render/useCanvas";
import useRender from "@app/hooks/render/useRender";
import useRenderLoop from "@app/hooks/render/useRenderLoop";
import useThreeRenderer from "@app/hooks/render/useThreeRenderer";

export interface CombinationPipelineTestProps {
  className?: string | undefined;
}
export default function CombinationPipelineTest(
  props: CombinationPipelineTestProps
): ReactElement {
  const renderer = useThreeRenderer();

  const tex1 = useMemo(
    () =>
      new THREE.WebGLRenderTarget(32, 32, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
      }),
    []
  );

  const tex2 = useMemo(
    () =>
      new THREE.WebGLRenderTarget(32, 32, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
      }),
    []
  );

  useEffect(() => {
    return () => {
      tex1.dispose();
      tex2.dispose();
    };
  }, []);

  const render = useRender({
    renderer,
  });

  const stageR = useFullScreenShaderPassHelper({
    fragmentShader: `void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); }`,
  });

  const stageG = useFullScreenShaderPassHelper({
    fragmentShader: `
      varying vec2 UV;
      uniform sampler2D prev;
      void main() { gl_FragColor = vec4(texture(prev, UV).rgb + vec3(0.0, 1.0, 0.0), 1.0); }`,
    uniforms: {
      prev: {
        value: tex1.texture,
      },
    },
  });

  const stageB = useFullScreenShaderPassHelper({
    fragmentShader: `
      varying vec2 UV;
      uniform sampler2D prev;
      void main() { gl_FragColor = vec4(texture(prev, UV).rgb + vec3(0.0, 0.0, 1.0), 1.0); }`,
    uniforms: {
      prev: {
        value: tex2.texture,
      },
    },
  });

  const stageA = useFullScreenShaderPassHelper({
    fragmentShader: `
      varying vec2 UV;
      uniform sampler2D prev;
      void main() { gl_FragColor = vec4(texture(prev, UV).rgb, 1.0); }`,
    uniforms: {
      prev: {
        value: tex1.texture,
      },
    },
  });

  const canvas = useCanvas({
    renderer,
    elementClassName: props.className,
  });

  useRenderLoop(() => {
    canvas.update();

    render({
      ...stageR,
      target: tex1,
    });
    render({
      ...stageG,
      target: tex2,
    });

    render({
      ...stageB,
      target: tex1,
    });
    render({
      ...stageA,
      target: null,
    });
  });

  return canvas.element;
}
