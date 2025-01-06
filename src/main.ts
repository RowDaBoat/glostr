import Glostr from './glostr/glostr.ts'

const shaders = [ "basic", "cyber-fuji", "grid", "starfield" ];
const posts = document.getElementById("glostr-posts")!!;
const shader = shaders[Math.floor(Math.random() * shaders.length)];
const glostr = new Glostr();

fetch("shaders/" + shader + ".glsl")
    .then((resource) => resource.text())
    .then((code) => glostr.shader(code, 4/3))
    .then((shader) => posts.appendChild(shader.container));
