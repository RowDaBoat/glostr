const vertexShaderSource =
`#version 300 es

in vec4 a_position;

void main() {
    gl_Position = a_position;
}
`

const defaultFragmentShaderSource =
`#version 300 es
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

out vec4 fragColor;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    fragColor = vec4(uv.x, uv.y * sin(u_time * 5.0), cos(u_time * 5.0), 1.0);
}
`

function glostr(fragment = defaultFragmentShaderSource) {
    const canvas = document.getElementsByClassName('shader')[0];
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const gl = canvas.getContext('webgl2');

    if (!gl) {
        alert('WebGL not supported!');
        throw new Error('WebGL not supported!');
    }

    const editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/glsl");
    editor.setValue(fragment, -1);

    ////////////////
    ///  Program  //
    ////////////////
    program = new GlostrProgram(gl, editor.getValue(), canvas.width, canvas.height);

    ///////////////
    ///  Editor  //
    ///////////////
    editor.session.on('change', () => {
        try {
            program?.destroy();
            program = new GlostrProgram(gl, editor.getValue(), canvas.width, canvas.height);
        } catch (e) {
            console.error(e);
        }
    });

    editor.container.addEventListener("mouseenter", () => {
        document.body.style.overscrollBehaviorX = 'none';
    });

    editor.container.addEventListener("mouseleave", () => {
        document.body.style.overscrollBehaviorX = 'unset';
    });

    new ResizeObserver(() => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        program.resize(canvas.width, canvas.height);
    }).observe(canvas);

    let startTime = Date.now();

    function render() {
        const time = (Date.now() - startTime) / 1000;
        program.render(time);
        requestAnimationFrame(render);
    }

    render();



    const button = document.getElementsByClassName('toggle-code')[0];
    const showCode = document.querySelector('.show-code');
    const showShader = document.querySelector('.show-shader');
    let showingCode = false;
    editor.container.style.display = "none";

    showShader.style.display = 'none';
    showCode.style.display = 'flex';

    button.addEventListener('click', () => {
        showingCode = !showingCode;

        const [activate, deactivate] = showingCode ? [showShader, showCode] : [showCode, showShader];
        activate.style.display = 'flex';
        deactivate.style.display = 'none';
        editor.container.style.display = showingCode? 'block' : 'none';
    });
}

class GlostrProgram {
    constructor(gl, fragmentSource, width, height) {
        this.gl = gl;
        const program = gl.createProgram();
        this.program = program;

        const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentSource);

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(program));
            throw new Error('Program linking failed');
        }

        gl.useProgram(program);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = [-1, -1, 1, -1, -1, 1, 1, 1];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        //get parameter locations
        const positionLocation = gl.getAttribLocation(program, 'a_position');
        this.resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
        this.timeUniformLocation = gl.getUniformLocation(program, 'u_time');

        //Initialize shader parameters
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.uniform2f(this.resolutionUniformLocation, width, height);

        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    render = function(time) {
        const gl = this.gl;

        gl.uniform1f(this.timeUniformLocation, time);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    resize = function(width, height) {
        const gl = this.gl;
        gl.uniform2f(this.resolutionUniformLocation, width, height);
        gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    }

    createShader = function(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            throw new Error('Shader compilation failed');
        }

        return shader;
    }
    
    destroy = function() {
        const gl = this.gl;
        const program = this.program;
        const shaders = gl.getAttachedShaders(program);

        shaders.forEach(shader => {
            gl.detachShader(program, shader);
            gl.deleteShader(shader);
        });

        gl.deleteProgram(program);
    };
}
