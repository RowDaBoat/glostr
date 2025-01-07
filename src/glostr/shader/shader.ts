import * as ace from 'ace-builds'
import Program from './program'
import ToggleCode from './toggleCode'
import { Mode } from './mode'
import html from './shader.html?raw'
import style from './shader.css?inline'

export default class Shader {
    private gl: WebGL2RenderingContext
    private _container: HTMLElement
    private program: Program
    private canvas: HTMLCanvasElement
    private startTime: number

    get container(): HTMLElement {
        return this._container
    }

    constructor(code: string, aspectRatio: number) {
        const container = buildElement(html, style)
        const canvas = container.querySelector('.shader-canvas') as HTMLCanvasElement
        const editor = container.querySelector('.shader-editor') as HTMLElement

        this._container  = container
        this.canvas = canvas;
        this.keepAspectRatio(aspectRatio)
        this.gl = this.setupCanvas(canvas)
        this.setupAce(editor, code)
        this.program = this.createProgram(code)
        this.startTime = Date.now()
        this.render()

        editor.style.display = "none";

        new ToggleCode(container)
            .onToggle(mode => {
                editor.style.display = mode == Mode.Code? 'block' : 'none';
            })
    }

    keepAspectRatio(aspectRatio: number) {
        const container = this.container

        new ResizeObserver(() => {
            if (aspectRatio == null)
                return;

            container.style.height = `${container.offsetWidth / aspectRatio}px`;
        }).observe(container);
    }

    setupCanvas(canvas: HTMLCanvasElement): WebGL2RenderingContext {
        const gl = canvas.getContext('webgl2')

        if (!gl) {
            alert('WebGL not supported!')
            throw new Error('WebGL not supported!')
        }

        new ResizeObserver(() => this.resize())
            .observe(canvas);
    
        return gl
    }

    setupAce(container: HTMLElement, fragmentCode: string) {
        const editor = ace.edit(container)
        editor.setTheme("ace/theme/monokai")
        editor.session.setMode("ace/mode/glsl")
        editor.setValue(fragmentCode, -1)
        const bodyStle = document.body.style

        container.addEventListener("mouseenter", () =>
            bodyStle.overscrollBehaviorX = 'none'
        );
    
        container.addEventListener("mouseleave", () =>
            bodyStle.overscrollBehaviorX = 'unset'
        );

        editor.session.on('change', () => {
            const newProgram = this.createProgram(editor.getValue())

            if (newProgram == null)
                return

            this.program?.destroy()
            this.program = newProgram
        });
    }

    createProgram(code: string): Program|null {
        try {
            const canvas = this.canvas
            return new Program(this.gl, code, canvas.width, canvas.height)
        } catch (e) {
            console.error(e)
            return null
        }
    }

    render() {
        const time = (Date.now() - this.startTime) / 1000
        this.program.render(time)
        requestAnimationFrame(() => this.render())
    }

    resize() {
        const canvas = this.canvas
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
        this.program.resize(canvas.width, canvas.height)
    }
}

function buildElement(htmlText: string, cssText: string): HTMLElement {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlText, 'text/html')
    const element = doc.body.firstElementChild as HTMLElement
    const style = document.createElement('style')
    style.textContent = cssText
    element.appendChild(style)
    return element
}
