export interface Entity {
    readonly descriptorId: string;
    readonly verticesToRender: number;
    readonly inputs: Input[];
}

interface Input {
    location: number;
    vertices: number[];
}
