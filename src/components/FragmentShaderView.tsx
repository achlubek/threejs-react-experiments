import { ReactElement, useMemo, useRef } from "react";

import * as THREE from "three";

import useCanvasRenderer, {
  CanvasOnDrawParams,
} from "@app/hooks/useCanvasRenderer";
import { useScene } from "@app/hooks/useScene";

export interface CameraViewProps<
  UniType extends Record<string, THREE.IUniform>
> {
  className?: string | undefined;
  onDraw: (params: CanvasOnDrawParams) => UniType;
  fragmentShader: string;
  uniforms: UniType;
}

export default function FragmentShaderView<
  UniType extends Record<string, THREE.IUniform>
>(props: CameraViewProps<UniType>): ReactElement {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const vertexShader = `
    varying vec2 UV;

    void main() {
        UV = uv;
        gl_Position = vec4(position, 1.0);
    }
  `;

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: props.uniforms,
        vertexShader,
        fragmentShader: props.fragmentShader,
        depthWrite: false,
        depthTest: false,
        blendEquationAlpha: THREE.NoBlending,
        transparent: true,
      }),
    []
  );

  const scene = useScene((s: THREE.Scene) => {
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    quad.name = "quadX";
    quad.userData = {
      material: mat,
    };
    s.add(quad);
  });

  const onDraw = (params: CanvasOnDrawParams): void => {
    mat.uniforms = props.onDraw(params);
  };

  const camera = useMemo(
    () => new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10.0),
    []
  );

  const canvasRenderer = useCanvasRenderer({
    elementClassName: props.className,
    overlayRef: elementRef,
    scene,
    camera,
    onDraw,
    onResize: () => {
      /**/
    },
  });

  return canvasRenderer.element;
}
