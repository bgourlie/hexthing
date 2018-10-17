export interface EntityDescriptor {
    readonly id: string;
    readonly fragmentShader: string;
    readonly vertexShader: string;
    readonly inputs: InputDescriptor[];
    readonly drawMode: GLenum;
}

interface InputDescriptor {
    readonly location: number;
    readonly bufferType: GLenum;
    readonly bufferDataType: GLenum;
    readonly numComponents: number;
}

