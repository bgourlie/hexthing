import {Err, is_err, Ok, Result} from "./Result.js";

export class Renderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly gl: WebGLRenderingContext;

  private constructor(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
    this.canvas = canvas;
    this.gl = gl;
  }

  static readonly Builder = class {
    private canvas: HTMLElement | null = null;
    private vertexShader: string | null = null;
    private fragmentShader: string | null = null;

    withCanvas(canvas: HTMLElement | null): this {
      this.canvas = canvas;
      return this;
    }

    withVertexShader(shader: string): this {
      this.vertexShader = shader;
      return this;
    }

    withFragmentShader(shader: string): this {
      this.fragmentShader = shader;
      return this;
    }

    build(): Result<Renderer> {
      if (!this.canvas) {
        return Err('You must supply a canvas element to the builder');
      }

      if (!this.vertexShader) {
        return Err('You must supply a vertex shader to the builder');
      }

      if (!this.fragmentShader) {
        return Err('You must supply a fragment shader to the builder');
      }

      if (this.canvas.nodeName !== 'CANVAS') {
        return Err('The supplied canvas element must be an actual canvas element');
      }

      const canvas = this.canvas as HTMLCanvasElement;
      const gl = canvas.getContext("webgl");
      if (gl === null) {
        return Err("Unable to initialize WebGL. Your browser may not support it.");
      }

      const vertexShader = Renderer.Builder.compileShader(gl, gl.VERTEX_SHADER, this.vertexShader);
      if (is_err(vertexShader)) {
        return Err(`An error occurred while compiling the vertex shader: ${vertexShader.message}`);
      }

      const fragmentShader = Renderer.Builder.compileShader(gl, gl.FRAGMENT_SHADER, this.fragmentShader);
      if (is_err(fragmentShader)) {
        return Err(`An error occurred while compiling the fragment shader: ${fragmentShader.message}`);
      }

      const shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vertexShader.value);
      gl.attachShader(shaderProgram, fragmentShader.value);
      gl.linkProgram(shaderProgram);

      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        return Err(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
      }

      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      return Ok(new Renderer(canvas, gl));
    }

    private static compileShader(gl: WebGLRenderingContext, type: number, source: string): Result<WebGLShader> {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return Err(gl.getShaderInfoLog(shader) || 'Unspecified error');
      }

      if (!shader) {
        return Err("Shader failed to compile");
      } else {
        return Ok(shader);
      }
    }
  }
}
