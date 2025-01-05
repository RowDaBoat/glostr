const content = `
    <button class="toggle-code">
        <span class="material-icons purple show-shader toggle">image</span>
        <span class="show-code toggle">
            <span class="white">{</span><span class="purple">gl</span><span class="white">}</span>
        </span>
    </button>
    <div class="editor"></div>
    <canvas class="shader"></canvas>  
`;

function glostrShader(container, fragment, aspectRatio = null) {
    container.innerHTML = content;

    new ResizeObserver(() => {
        if (aspectRatio == null)
            return;

        container.style.height = `${container.offsetWidth / aspectRatio}px`;
    }).observe(container);

    const canvas = container.getElementsByClassName('shader')[0];
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const gl = canvas.getContext('webgl2');

    if (!gl) {
        alert('WebGL not supported!');
        throw new Error('WebGL not supported!');
    }

    const editorContainer = container.getElementsByClassName("editor")[0];
    const editor = ace.edit(editorContainer);
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



    const button = container.getElementsByClassName('toggle-code')[0];
    const showCode = container.querySelector('.show-code');
    const showShader = container.querySelector('.show-shader');
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
