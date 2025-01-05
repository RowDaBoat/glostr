#version 300 es
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

out vec4 fragColor;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;

    fragColor = vec4(
        uv.x,
        uv.y * sin(u_time * 5.0),
        cos(u_time * 5.0),
        1.0
    );
}
