import {Renderer} from "./Renderer.js";
import {is_ok} from "./Result.js";

const vsSource = `
    attribute vec4 aVertexPosition;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `;

const fsSource = `
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
  `;

document.addEventListener('DOMContentLoaded', function () {
  const rendererResult = new Renderer.Builder()
    .withCanvas(document.querySelector('#viewport'))
    .withVertexShader(vsSource)
    .withFragmentShader(fsSource)
    .build();

  if (is_ok(rendererResult)) {
    const renderer = rendererResult.value;
  } else {
    alert(`An error occurred while initializing the renderer: ${rendererResult.message}`);
  }
});
