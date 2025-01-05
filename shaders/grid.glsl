#version 300 es
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

out vec4 fragColor;

void main() {
    vec2 pixel = gl_FragCoord.xy;;

    int on = float(int(pixel.x) % 2) == float(int(pixel.y) % 2) ? 0 : 1;

    fragColor = vec4(
        on,
        on,
        on,
        1
    );
}
