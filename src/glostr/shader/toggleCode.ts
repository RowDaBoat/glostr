import { Mode } from './mode'

export default class ToggleCode {
    private state: Mode = Mode.Shader
    private button: HTMLButtonElement
    private showCode: HTMLElement
    private showShader: HTMLElement

    constructor(container: HTMLElement) {
        this.button = container.querySelector('.toggle-code')!! as HTMLButtonElement
        this.showCode = container.querySelector('.show-code')!! as HTMLElement
        this.showShader = container.querySelector('.show-shader')!!  as HTMLElement
        this.showCode.style.display = 'flex'
        this.showShader.style.display = 'none'
    }

    onToggle(listener: (mode: Mode) => void) {
        this.button.addEventListener('click', () => {
            this.state = (this.state + 1) % 2

            switch (this.state) {
                case Mode.Code:
                    this.showCode.style.display = 'none'
                    this.showShader.style.display = 'flex'
                break;
                case Mode.Shader: 
                    this.showCode.style.display = 'flex'
                    this.showShader.style.display = 'none'
                break;
            }

            listener(this.state)
        })
    }
}
