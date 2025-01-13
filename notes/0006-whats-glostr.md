# What's glostr?


## Brief intro
#glostr is a pet-project of mine to better understand how #nostr works. Since I'm an engineer, and somewhere between a game programmer and a graphics programmer, I'll do what I do best: write some graphics thing no one (but me) will use.


## Zappable Shadertoy
So, the idea is to create a small platform on top of #nostr where people can create, visualize, and share computer graphics programs (aka: shaders). Code shiny thing, see shiny, share shiny thing, and zap shiny thing. If you're familiar with [Shadertoy](https://shadertoy.com), #glostr is just that: **zappable shadertoy**.

![bitcoin glostr](https://rowdaboat.github.io/glostr/notes/images/zap-shader.png)

## Milestone Zero
So, first step was to write a quick and dirty prototype client (remember, I specc'd into game dev, not into web dev, so I really mean _quick_ and I really mean _dirty_). I got an [ace editor](https://github.com/ajaxorg/ace) thing working, duct-taped it to a basic WebGL render, stole a couple shaders from shadertoy (jk, I gave credit), poured some CSS magic, glued some `nostr-rx`, and published it to GitHub pages.

After 2 or 3 days of iterating, and with some assistance from an LLM, you can see the result linked on my [notes](https://njump.me/nevent1qqsf45hy66cw55e3s2ewt6upe3m073q875hmjjtyyre7qtaxw9hl5scpp4mhxue69uhkummn9ekx7mqpzemhxue69uhhyetvv9ujumn0wd68ytnzv9hxgq3qu3svk99639mcdfn43s2nawg4a2j4ejmgrq2n63l4t67wzqdmtnkss70qyf).

Yes. I used `kind 1` posts to spam GLSL code.

I AM SORRY. I KNOW BETTER NOW. I SWEAR.

So, right now #glostr is:
- Taking an npub on the url after the #
- Rendering all `kind 1` posts from that npub containing GLSL code between \`\`\`s
- Allowing the user to edit the code in real time

![bitcoin glostr](https://rowdaboat.github.io/glostr/notes/images/btc-shader.png)


## Next Steps
What now? @Agustin_Kassis made me realize my _obvious_ `kind 1` spamming. After some brainstorming and skimming through NIPs and kinds, we arrived at the conclusion that [Long-form Notes (NIP-23)](https://github.com/nostr-protocol/nips/blob/master/23.md) are best suited for the content I want #glostr to display:
- Format is Markdown, which I like and which I was already somewhat expecting.
- It's editable content, so mistakes can be amended, which is more than usual in shader programming.

So, the next features I want to add are:
- Logging in
- Posting NIP-23 Notes
- Getting, parsing, and showing NIP-23 Notes


## When
I'll only work on this on the weekends for now, so I don't know. This is a pet project for fun right now.


## Wrapping Up
Repo: https://github.com/rowdaboat/glostr
Try it: https://rowdaboat.github.io/glostr/

As this is a Long-Form Note in itself, I'll finish it by sharing a shader based on [Inigo Quilez's awesome polygon shader](https://www.shadertoy.com/view/wdBXRW). This note should show as a shader on #glostr in the next iteration, but you can copy and paste the code in the editor for now:

```glsl
#version 300 es
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

out vec4 fragColor;

const int N = 6;
vec3 yellow = vec3(0.45, 0.3, 0.15);
vec3 lightBlue = vec3(0.65, 0.85, 1.0);

float polygon(in vec2 p, in vec2[N] v)
{
    const int num = v.length();
    float d = dot(p - v[0], p - v[0]);
    float s = 1.;

    for(int i=0, j=num-1; i < num; j=i, i++ )
    {
        vec2 e = v[j] - v[i];
        vec2 w = p - v[i];
        vec2 b = w - e * clamp(dot(w, e) / dot(e, e), 0.0, 1.0);
        d = min(d, dot(b,b));

        bvec3 condition = bvec3(
            p.y >= v[i].y,
            p.y < v[j].y, 
            e.x * w.y > e.y * w.x
        );

        if (all(condition) || all(not(condition)))
            s =- s;
    }
    
    return s * sqrt(d);
}

void main()
{
	vec2 p = (2.0 * gl_FragCoord.xy - u_resolution.xy) / u_resolution.y;
    float d = polygon(p, vec2[](
        vec2( .2,  .8), vec2(-.5, -.125), vec2( .0, -.125),
        vec2(-.2, -.8), vec2( .5,  .125), vec2( .0,  .125)
    ));

    vec3 color = d < 0.0 ? yellow : lightBlue;
	color *= 1. - exp(-40. * abs(d));
	color *= .8 + .2 * sin(10.0 * d - 10. * u_time) * sin(-1.25 * u_time);
    color *= exp(1. - d * 2.25);

    fragColor = vec4(color, 1.0);
}
```
