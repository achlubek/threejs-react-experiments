import {
  Camera,
  Scene,
  ToneMapping,
  Vector2,
  Vector4,
  WebGLRenderTarget,
  WebGLRenderer,
} from "three";

export const renderToTarget = (props: {
  renderer: WebGLRenderer;
  target: WebGLRenderTarget | null;
  camera: Camera;
  scene: Scene;
  toneMapping?: ToneMapping | undefined;
}): void => {
  const oldRenderTarget = props.renderer.getRenderTarget();
  const oldViewport = props.renderer.getViewport(new Vector4());
  const oldToneMapping = props.renderer.toneMapping;

  props.renderer.setRenderTarget(props.target);
  const size = props.renderer.getSize(new Vector2());
  props.renderer.setViewport(
    0,
    0,
    props.target?.width ?? size.x,
    props.target?.height ?? size.y
  );
  props.renderer.toneMapping = props.toneMapping ?? oldToneMapping;

  props.renderer.render(props.scene, props.camera);

  props.renderer.setRenderTarget(oldRenderTarget);
  props.renderer.setViewport(oldViewport);
  props.renderer.toneMapping = oldToneMapping;
};
