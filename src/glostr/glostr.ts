import Shader from './shader/shader.ts'

class Glostr {
    shader(code: string, aspectRatio: number = 3/4): Shader {
        return new Shader(code, aspectRatio);
    }
}

export default Glostr;
