export interface EntityDescriptor {
    readonly id: string;
    readonly fragmentShader: string;
    readonly vertexShader: string;
    readonly verticesDescriptor: VerticesAttributeDescriptor;
    readonly drawMode: GLenum;
}

interface VerticesAttributeDescriptor {
    readonly bufferType: GLenum;
    readonly shaderIdentifier: string;
    readonly numComponents: number;
}
