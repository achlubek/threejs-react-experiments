import {
  Camera,
  Scene,
  ToneMapping,
  Vector4,
  WebGLRenderTarget,
  WebGLRenderer,
} from "three";

export const renderToTarget = (props: {
  renderer: WebGLRenderer;
  target: WebGLRenderTarget;
  camera: Camera;
  scene: Scene;
  toneMapping?: ToneMapping | undefined;
}) => {
  const oldRenderTarget = props.renderer.getRenderTarget();
  const oldViewport = props.renderer.getViewport(new Vector4());
  const oldToneMapping = props.renderer.toneMapping;

  props.renderer.setRenderTarget(props.target);
  props.renderer.setViewport(0, 0, props.target.width, props.target.height);
  props.renderer.toneMapping = props.toneMapping ?? oldToneMapping;

  props.renderer.render(props.scene, props.camera);

  props.renderer.setRenderTarget(oldRenderTarget);
  props.renderer.setViewport(oldViewport);
  props.renderer.toneMapping = oldToneMapping;
};
