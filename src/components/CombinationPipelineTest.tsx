import { ReactElement } from "react";

import useFragmentShaderBuffer from "@app/hooks/render/buffer/useFragmentShaderBuffer";
import useFragmentShaderView from "@app/hooks/render/canvas/useFragmentShaderView";
import useRenderer from "@app/hooks/render/useRenderer";

export interface CombinationPipelineTestProps {
  className?: string | undefined;
}
export default function CombinationPipelineTest(
  props: CombinationPipelineTestProps
): ReactElement {
  const renderer = useRenderer();

  const stageR = useFragmentShaderBuffer({
    fragmentShader: `void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }`,
    height: 32,
    width: 32,
    renderer,
  });

  const stageG = useFragmentShaderBuffer({
    fragmentShader: `
    varying vec2 UV;
    uniform sampler2D prev;
    void main() { gl_FragColor = vec4(texture(prev, UV).rgb + vec3(0.0, 1.0, 0.0), 1.0); }`,
    height: 32,
    width: 32,
    renderer,
    uniforms: {
      prev: {
        value: stageR.texture.texture,
      },
    },
  });

  const stageB = useFragmentShaderBuffer({
    fragmentShader: `
    varying vec2 UV;
    uniform sampler2D prev;
    void main() { gl_FragColor = vec4(texture(prev, UV).rgb + vec3(0.0, 0.0, 1.0), 1.0); }`,
    height: 32,
    width: 32,
    renderer,
    uniforms: {
      prev: {
        value: stageG.texture.texture,
      },
    },
  });

  const stageA = useFragmentShaderView({
    elementClassName: props.className,
    fragmentShader: `
    varying vec2 UV;
    uniform sampler2D prev;
    void main() { gl_FragColor = vec4(texture(prev, UV).rgb, 1.0); }`,
    renderer,
    uniforms: {
      prev: {
        value: stageB.texture.texture,
      },
    },
    onDraw: () => {
      stageR.render();
      stageG.render();
      stageB.render();
      return null;
    },
  });

  return stageA.element;
}
