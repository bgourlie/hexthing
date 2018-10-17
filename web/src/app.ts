import {Renderer} from "./Renderer";
import {is_ok} from "./Result";
import {EntityDescriptor} from "./EntityDescriptor";
import {Entity} from "./Entity";

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


const planeDescriptor: EntityDescriptor= {
    id: 'plane',
    fragmentShader: fsSource,
    vertexShader: vsSource,
    drawMode: 1, //todo: this is being ignored and triangle_strip is always being used (need gl instance to access enum)
    verticesDescriptor: {
        bufferType: 1, //todo: this is being ignored and array_buffer is always being used (need gl instance to access enum)
        numComponents: 2,
        shaderIdentifier: 'aVertexPosition',
    }
};

const plane: Entity = {
    descriptorId: 'plane',
    vertices: [
      -1.0,  1.0,
      1.0,  1.0,
      -1.0, -1.0,
      1.0, -1.0,
    ]
};

document.addEventListener('DOMContentLoaded', function () {
    const rendererResult = new Renderer.Builder()
        .withCanvas(document.querySelector('#viewport'))
        .registerEntity(planeDescriptor)
        .build();

    if (is_ok(rendererResult)) {
        const renderer = rendererResult.value;
        renderer.drawScene([plane]);
    } else {
        alert(`An error occurred while initializing the renderer: ${rendererResult.message}`);
    }
});
