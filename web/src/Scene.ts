import { Entity } from './Entity';
import { mat4 } from 'gl-matrix';
import { Err, Ok, Result } from './Result';

export class Scene {
    private readonly _projectionMatrix: mat4;
    private readonly _entities: Map<string, Entity[]> = new Map();

    private constructor(projectionMatrix: mat4) {
        this._projectionMatrix = projectionMatrix;
    }

    addEntity(entity: Entity) {
        const entitiesOfType = this._entities.get(entity.descriptorId);
        if (!entitiesOfType) {
            this._entities.set(entity.descriptorId, [entity]);
        } else {
            entitiesOfType.push(entity);
        }
    }

    get entities(): IterableIterator<[string, Entity[]]> {
        return this._entities.entries();
    }

    get projectionMatrix(): mat4 {
        return mat4.clone(this._projectionMatrix);
    }

    static Builder = class {
        private fieldOfView?: number;
        private zNear?: number;
        private zFar?: number;
        private aspectRatio?: number;

        withFieldOfView(fov: number): this {
            this.fieldOfView = fov;
            return this;
        }

        withZNear(zNear: number): this {
            this.zNear = zNear;
            return this;
        }

        withZFar(zFar: number): this {
            this.zFar = zFar;
            return this;
        }

        withAspectRatio(aspectRatio: number): this {
            this.aspectRatio = aspectRatio;
            return this;
        }

        build(): Result<Scene> {
            if (!this.fieldOfView) {
                return Err('You must supply a fieldOfView');
            }

            if (!this.zNear) {
                return Err('You must provide a zNear');
            }

            if (!this.zFar) {
                return Err('You must provide a zFar');
            }

            if (!this.aspectRatio) {
                return Err('You must provide an aspect ratio');
            }

            const projectionMatrix = mat4.create();
            mat4.perspective(projectionMatrix, this.fieldOfView, this.aspectRatio, this.zNear, this.zFar);

            return Ok(new Scene(projectionMatrix));
        }
    };
}
