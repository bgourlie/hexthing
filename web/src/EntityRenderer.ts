import {EntityDescriptor} from "./EntityDescriptor";

export interface EntityRenderer {
    readonly descriptor: EntityDescriptor;
    readonly program: WebGLProgram;
    readonly vertexLocation: GLint;
    readonly projectionMatrixLocation: WebGLUniformLocation;
    readonly modelViewMatrixLocation: WebGLUniformLocation;
}
