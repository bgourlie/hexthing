export interface EntityDescriptor {
    readonly id: string;
    readonly fragmentShader: string;
    readonly vertexShader: string;
    readonly inputs: InputDescriptor[];
    readonly drawMode: GLenum;
    readonly verticesToRender: number;
}

interface InputDescriptor {
    readonly location: number;
    readonly bufferType: GLenum;
    readonly bufferDataType: GLenum;
    readonly numComponents: number;
    readonly vertices: Float32Array | Float64Array;
}
