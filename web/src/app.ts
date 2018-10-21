import { Renderer } from './Renderer';
import { is_err } from './Result';
import { EntityDescriptor } from './EntityDescriptor';
import { Scene } from './Scene';

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
    id: 'hexTile',
    fragmentShader: fsSource,
    vertexShader: vsSource,
    drawMode: WebGL2RenderingContext.TRIANGLE_FAN,
    inputs: [
        {
            location: 0,
            bufferType: WebGL2RenderingContext.ARRAY_BUFFER,
            bufferDataType: WebGL2RenderingContext.FLOAT,
            numComponents: 2,
            vertices: new Float32Array([
                0.0,
                0.0,
                0.8660254037844387,
                -0.5,
                0.8660254037844387,
                0.5,
                0.0,
                1.0,
                -0.8660254037844387,
                0.5,
                -0.8660254037844387,
                -0.5,
                0,
                -1,
                0.8660254037844387,
                -0.5
            ])
        }
    ],
    verticesToRender: 8
};

document.addEventListener('DOMContentLoaded', function() {
    const sceneResult = new Scene.Builder()
        .withAspectRatio(1)
        .withFieldOfView(45 * Math.PI / 180) // in radians
        .withZNear(0.1)
        .withZFar(100.0)
        .build();

    if (is_err(sceneResult)) {
        alert(sceneResult.message);
        return;
    }

    const rendererResult = new Renderer.Builder()
        .withCanvas(document.querySelector('#viewport'))
        .registerEntity(planeDescriptor)
        .build();

    if (is_err(rendererResult)) {
        alert(`An error occurred while initializing the renderer: ${rendererResult.message}`);
        return;
    }

    const scene = sceneResult.value;
    const renderer = rendererResult.value;

    scene.addEntity({
        descriptorId: 'hexTile',
        sceneTransform: [-0.88, 0.0, -8.0]
    });

    scene.addEntity({
        descriptorId: 'hexTile',
        sceneTransform: [0.88, 0.0, -8.0]
    });

    scene.addEntity({
        descriptorId: 'hexTile',
        sceneTransform: [0.0, 1.52, -8.0]
    });

    scene.addEntity({
        descriptorId: 'hexTile',
        sceneTransform: [-1.76, 1.52, -8.0]
    });

    scene.addEntity({
        descriptorId: 'hexTile',
        sceneTransform: [1.76, -1.52, -8.0]
    });

    renderer.drawScene(scene);
});
