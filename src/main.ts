import Glostr from './glostr/glostr.ts'

const shaders = [ "basic", "cyber-fuji", "starfield", "fractal-pyramid" ]
    .map(value => ({value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)

shaders.forEach(shader => {
    const posts = document.getElementById("glostr-posts")!!;
    const glostr = new Glostr();
    
    fetch("shaders/" + shader + ".glsl")
        .then((resource) => resource.text())
        .then((code) => glostr.shader(code, 4/3))
        .then((shader) => posts.appendChild(shader.container));    
})

console.log(window.location.hash.substring(1))
