/// <reference types="vite/client" />

declare module '*.glsl' {
    const content: string;
    export default content;
}

declare module '*.html?raw' {
    const content: string;
    export default content;
}
