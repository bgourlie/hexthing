import { Renderer } from './Renderer';
import { is_ok } from './Result';
import { EntityDescriptor } from './EntityDescriptor';
import { Entity } from './Entity';

const vsSource = `#version 300 es
    layout(location = 0) in vec4 position;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * position;
    }
  `;

const fsSource = `#version 300 es
    precision mediump float;
    out vec4 fragColor;
    
    void main() {
      fragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
  `;

const planeDescriptor: EntityDescriptor = {
    id: 'plane',
    fragmentShader: fsSource,
    vertexShader: vsSource,
    drawMode: WebGL2RenderingContext.TRIANGLE_STRIP,
    inputs: [
        {
            location: 0,
            bufferType: WebGL2RenderingContext.ARRAY_BUFFER,
            bufferDataType: WebGL2RenderingContext.FLOAT,
            numComponents: 2,
            vertices: new Float32Array([-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0])
        }
    ],
    verticesToRender: 4
};

const entities: Entity[] = [
    {
        descriptorId: 'plane',
        position: [-0.0, 0.0, -6.0]
    },
    {
        descriptorId: 'plane',
        position: [-2.5, 1.5, -9.0]
    }
];

document.addEventListener('DOMContentLoaded', function() {
    const rendererResult = new Renderer.Builder()
        .withCanvas(document.querySelector('#viewport'))
        .registerEntity(planeDescriptor)
        .build();

    if (is_ok(rendererResult)) {
        const renderer = rendererResult.value;
        renderer.drawScene(entities);
    } else {
        alert(`An error occurred while initializing the renderer: ${rendererResult.message}`);
    }
});
