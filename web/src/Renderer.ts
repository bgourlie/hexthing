import { Err, is_err, Ok, Result } from './Result';
import { mat4 } from 'gl-matrix';
import { EntityDescriptor } from './EntityDescriptor';
import { EntityRenderer } from './EntityRenderer';
import { Entity } from './Entity';

export class Renderer {
    private readonly gl: WebGL2RenderingContext;
    private readonly entityRenderers: Map<string, EntityRenderer>;

    private constructor(gl: WebGL2RenderingContext, entityRenderers: Map<string, EntityRenderer>) {
        this.gl = gl;
        this.entityRenderers = entityRenderers;
    }

    drawScene(entities: Entity[]): Result<null> {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        const fieldOfView = 45 * Math.PI / 180; // in radians
        const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
        const numEntities = entities.length;
        for (let i = 0; i < numEntities; i++) {
            const entity = entities[i];
            const e = this.entityRenderers.get(entity.descriptorId);

            if (!e) {
                return Err(`No renderer found for descriptorId '${entity.descriptorId}'`);
            }

            const modelViewMatrix = mat4.create();
            mat4.translate(modelViewMatrix, modelViewMatrix, entity.position);

            this.gl.bindVertexArray(e.vertexArray);

            for (let i = 0; i < e.descriptor.inputs.length; i++) {
                const inputDescriptor = e.descriptor.inputs[i];
                this.gl.bufferData(inputDescriptor.bufferType, inputDescriptor.vertices, this.gl.STATIC_DRAW, 0);
            }

            this.gl.useProgram(e.program);

            this.gl.uniformMatrix4fv(e.projectionMatrixLocation, false, projectionMatrix);
            this.gl.uniformMatrix4fv(e.modelViewMatrixLocation, false, modelViewMatrix);
            this.gl.drawArrays(e.descriptor.drawMode, 0, e.descriptor.verticesToRender);
            this.gl.bindVertexArray(null);
        }

        return Ok(null);
    }

    static readonly Builder = class {
        private canvas: HTMLElement | null = null;
        private readonly entityDescriptors: Array<EntityDescriptor> = [];

        withCanvas(canvas: HTMLElement | null): this {
            this.canvas = canvas;
            return this;
        }

        registerEntity(descriptor: EntityDescriptor): this {
            this.entityDescriptors.push(descriptor);
            return this;
        }

        build(): Result<Renderer> {
            if (!this.canvas) {
                return Err('You must supply a canvas element to the builder');
            }

            if (this.canvas.nodeName !== 'CANVAS') {
                return Err('The supplied canvas element must be an actual canvas element');
            }

            const canvas = this.canvas as HTMLCanvasElement;
            const gl = canvas.getContext('webgl2');
            if (gl === null) {
                return Err('Unable to initialize WebGL 2. Your browser may not support it.');
            }

            if (this.entityDescriptors.length === 0) {
                return Err('You must supply at least one entity descriptor');
            }

            // Create renderers for each registered entity descriptor
            const entityRenderers = new Map<string, EntityRenderer>();
            for (let i = 0; i < this.entityDescriptors.length; i++) {
                const descriptor = this.entityDescriptors[i];
                if (entityRenderers.has(descriptor.id)) {
                    return Err(`An entity descriptor with id ${descriptor.id} has already been registered`);
                }

                const shaderProgramResult = Renderer.Builder.createProgram(gl, descriptor);

                if (is_err(shaderProgramResult)) {
                    return Err(shaderProgramResult.message);
                }

                const projectionMatrixLocation = gl.getUniformLocation(shaderProgramResult.value, 'uProjectionMatrix');
                const modelViewMatrixLocation = gl.getUniformLocation(shaderProgramResult.value, 'uModelViewMatrix');

                if (!projectionMatrixLocation) {
                    return Err('Failed to get projection matrix location');
                }

                if (!modelViewMatrixLocation) {
                    return Err('Failed to get model view matrix location');
                }

                const vertexArray = gl.createVertexArray();

                if (vertexArray === null) {
                    return Err('Unable to create vertex array object');
                }

                const buffer = gl.createBuffer();
                gl.bindVertexArray(vertexArray);

                for (let i = 0; i < descriptor.inputs.length; i++) {
                    const inputDescriptor = descriptor.inputs[i];
                    gl.enableVertexAttribArray(inputDescriptor.location);
                    gl.bindBuffer(inputDescriptor.bufferType, buffer);
                    gl.vertexAttribPointer(
                        inputDescriptor.location,
                        inputDescriptor.numComponents,
                        inputDescriptor.bufferDataType,
                        false,
                        0,
                        0
                    );
                }

                gl.bindVertexArray(null);

                const entityRenderer: EntityRenderer = {
                    program: shaderProgramResult.value,
                    descriptor,
                    vertexArray,
                    projectionMatrixLocation,
                    modelViewMatrixLocation
                };

                entityRenderers.set(descriptor.id, entityRenderer);
            }

            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);

            return Ok(new Renderer(gl, entityRenderers));
        }

        private static createProgram(gl: WebGLRenderingContext, descriptor: EntityDescriptor): Result<WebGLProgram> {
            const vertexShader = Renderer.Builder.compileShader(gl, gl.VERTEX_SHADER, descriptor.vertexShader);

            if (is_err(vertexShader)) {
                return Err(vertexShader.message);
            }

            const fragmentShader = Renderer.Builder.compileShader(gl, gl.FRAGMENT_SHADER, descriptor.fragmentShader);

            if (is_err(fragmentShader)) {
                return Err(fragmentShader.message);
            }

            const shaderProgram = gl.createProgram();

            if (shaderProgram === null) {
                return Err(`Unable to create shader program for entity descriptor [id ${descriptor.id}]`);
            }

            gl.attachShader(shaderProgram, vertexShader.value);
            gl.attachShader(shaderProgram, fragmentShader.value);
            gl.linkProgram(shaderProgram);

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                return Err(
                    `Unable to initialize the shader program for entity descriptor [id ${
                        descriptor.id
                    }: ${gl.getProgramInfoLog(shaderProgram)}`
                );
            }

            return Ok(shaderProgram);
        }

        private static compileShader(gl: WebGLRenderingContext, type: number, source: string): Result<WebGLShader> {
            const shader = gl.createShader(type);

            if (shader === null) {
                return Err('Shader creation failed');
            }

            gl.shaderSource(shader, source);
            gl.compileShader(shader);

            const compileStatus = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
            if (!compileStatus) {
                const err = Err(gl.getShaderInfoLog(shader) || `Unspecified error. Compile status: ${compileStatus}`);
                gl.deleteShader(shader);
                return err;
            }

            if (!shader) {
                return Err('Shader failed to compile');
            } else {
                return Ok(shader);
            }
        }
    };
}
