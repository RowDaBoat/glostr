import vertexSource from './vertex.glsl?raw'

export default class Program {
    private gl: WebGL2RenderingContext
    private program: WebGLProgram
    private positionLocation: number;
    private resolutionUniformLocation: WebGLUniformLocation;
    private timeUniformLocation: WebGLUniformLocation;

    constructor(gl: WebGL2RenderingContext, fragmentSource: string, width: number, height: number) {
        this.gl = gl;
        const program = gl.createProgram()
            ?? fail("Could not create gl program.")

        this.program = program;

        this.setupProgram(fragmentSource)
        this.setupGeometry()

        this.positionLocation = gl.getAttribLocation(program, 'a_position')
            ?? fail("Could not get position attribute location.")

        this.resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution')
            ?? fail("Could not get resolution uniform location.")

        this.timeUniformLocation = gl.getUniformLocation(program, 'u_time')
            ?? fail("Could not get time uniform location.")

        this.setupParameters(width, height)
        this.setupViewport()
    }

    render(time: number) {
        const gl = this.gl;

        gl.uniform1f(this.timeUniformLocation, time);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    resize(width: number, height: number) {
        const gl = this.gl;
        gl.uniform2f(this.resolutionUniformLocation, width, height);
        gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    }

    destroy() {
        const gl = this.gl;
        const program = this.program;
        const shaders = gl.getAttachedShaders(program);

        shaders?.forEach(shader => {
            gl.detachShader(program, shader);
            gl.deleteShader(shader);
        });

        gl.deleteProgram(program);
    }

    private setupProgram(fragmentSource: string) {
        const gl = this.gl
        const program = this.program

        const vertexShader = this.createShader(
            gl.VERTEX_SHADER, vertexSource
        )

        const fragmentShader = this.createShader(
            gl.FRAGMENT_SHADER, fragmentSource
        )

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
    
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(program));
            throw new Error('Program linking failed');
        }

        gl.useProgram(program);
    }

    private setupGeometry() {
        const gl = this.gl
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = [-1, -1, 1, -1, -1, 1, 1, 1];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    }

    private setupParameters(width: number, height: number) {
        const gl = this.gl
        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.uniform2f(this.resolutionUniformLocation, width, height);
    }

    private setupViewport() {
        const gl = this.gl
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    private createShader(type: number, code: string) {
        const gl = this.gl;
        const shader = gl.createShader(type)

        if (shader == null)
            throw Error('Could not create shader program.')

        gl.shaderSource(shader, code);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            throw new Error('Shader compilation failed');
        }

        return shader;
    }
}

function fail(message: string): any {
    throw new Error(message);
}

