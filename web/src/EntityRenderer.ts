import { EntityDescriptor } from './EntityDescriptor';

export interface EntityRenderer {
    readonly descriptor: EntityDescriptor;
    readonly program: WebGLProgram;
    readonly vertexArray: WebGLVertexArrayObject;
    readonly projectionMatrixLocation: WebGLUniformLocation;
    readonly modelViewMatrixLocation: WebGLUniformLocation;
}
