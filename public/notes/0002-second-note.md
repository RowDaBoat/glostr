Weee it's working!!
Some clients like Primal are making my url dissapear tho T___T

Watch this shader in action and play with its code at https://rowdaboat.github.io/glostr/#npub1u3svk99639mcdfn43s2nawg4a2j4ejmgrq2n63l4t67wzqdmtnks2uxaql

```glsl
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
```