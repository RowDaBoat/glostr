This one is all mine SDF+Raymarching+Raytracing.
[ Sorry for turning your GPU into a stove ]

You can watch this at #glostr:
https://rowdaboat.github.io/glostr/#npub1u3svk99639mcdfn43s2nawg4a2j4ejmgrq2n63l4t67wzqdmtnks2uxaql

```glsl
#version 300 es
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

out vec4 fragColor;

#define MAXDISTANCE 180.
#define EPSILON 0.001
#define TENTH_EPSILON 0.0001

float time;

///////////////
// Structures
struct Camera {
    vec3 position;
    vec3 direction;
    vec3 up;
    vec3 left;
    vec2 resolution;
};

struct Ray {
    vec3 origin;
    vec3 direction;
};

#define SKYBOX 0
#define GEOMETRY 1

struct Material {
    vec3 color;
    vec3 emissive;
    float roughness;
};

struct Hit {
    vec3 point;
    float distance;
    vec3 normal;
    Material material;
};


/////////////
// Material
Material material(vec3 color, vec3 emissive, float roughness) {
    Material material;
    material.color = color;
    material.emissive = emissive;
    material.roughness = roughness;
    return material;
}


/////////////
// Ray Hits

Hit noHit() {
    Hit hit;
    hit.distance = .0;
    hit.material.emissive = vec3(0, 0, 0);
    hit.material.color = vec3(1, 1, 1);
    hit.material.roughness = 1.;

    return hit;
}


///////////
// Random
vec4 random;

void shuffle() {
    random = fract(1e4 * sin(random) + random.wxyz + 0.5);
}

void initRandom(vec2 normalizedPixel, float frame) {
    random = vec4(normalizedPixel, frame, 1);

    for(int i = 0; i < 16; i++)
        shuffle();
}


////////////////////////
// Viewport and Camera
vec2 viewport(vec2 coordinate, vec2 resolution) {
    vec2 normalized = coordinate.xy / resolution.xy;
	vec2 centered = -1.0 + 2.0 * normalized;
    float aspectRatio = resolution.x / resolution.y;
    return vec2(centered.x * aspectRatio, centered.y);
}

Camera camera(vec3 position, vec3 target, float roll, vec2 resolution) {
    Camera camera;
    camera.position = position;
    camera.direction = normalize(target - position);
    vec3 rolling = vec3(sin(roll), cos(roll), .0);
    camera.up = normalize(cross(camera.direction, rolling));
    camera.left = normalize(cross(camera.up, camera.direction));
    camera.resolution = resolution;

    return camera;
}

Ray cameraRay(Camera camera, vec2 point) {
    vec2 displacedPoint = point + random.xy / (0.5 * camera.resolution.xy);
    vec3 displacement =
        displacedPoint.x * camera.up +
        displacedPoint.y * camera.left;

    Ray ray;
    ray.origin = camera.position;
    ray.direction = normalize(displacement + 1.5 * camera.direction);

    return ray;
}

#define SAMPLES   15
#define BOUNCES    4
#define MAX_STEPS 25

//////////////////////////
// SDF Scene
float smoothMin(float d1, float d2, float k) {
    float h = max(k - abs(d1 - d2), 0.0) / k;
    return min(d1, d2) - h * h * h * k * (1.0 / 6.0);
}

float box(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float cylinder(vec3 p, float h, float r) {
  vec2 d = abs(vec2(length(p.xz),p.y)) - vec2(r,h);
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

float coin(vec3 point) {
    float base = cylinder(point, .1, 1.);
    float coinCarve = cylinder(point + vec3(0., -.54, 0.), .5, .9);

    float lbar = box(point + vec3(.125, 0., 0.), vec3(.06, .09, .75));
    float rbar = box(point + vec3(-.125, 0., 0.), vec3(.06, .09, .75));
    float back = box(point + vec3(.1, 0., 0.), vec3(.3, .09, .6));
    float bars = min(lbar, rbar);

    float tbelly = cylinder(point + vec3(-.175, 0, 0.25), .09, .35);
    float bbelly = cylinder(point + vec3(-.175, 0, -.25), .09, .35);
    float bellies = min(tbelly, bbelly);
    float b = min(min(back, bars), bellies);

    float carveTBelly = cylinder(point + vec3(-.175, 0, 0.25), 1., .175);
    float carveBBelly = cylinder(point + vec3(-.175, 0, -.25), 1., .175);
    float carveTBox = box(point + vec3(-.05, 0, 0.25), vec3(.1, 1, .175));
    float carveBBox = box(point + vec3(-.05, 0, -.25), vec3(.1, 1, .175));
    float bellyCarving = min(min(carveTBelly, carveBBelly), min(carveTBox, carveBBox));
    float backCarving = box(point + vec3(.5, 0, 0), vec3(.25, 1, .45));
    float carve = min(bellyCarving, backCarving);
    float carvedB = max(b, -carve);

    return min(max(base, -coinCarve), carvedB);
}

float moon(vec3 point) {
    float time = u_time * 2.0;
    return length(point - vec3(1.5, 2.5, -1.6 + .125 * sin(time))) - 1.75;
}

float orbiter(vec3 point) {
    float time = u_time * .5;
    vec3 position = vec3(.9 * sin(time), -0.25, .9 * cos(time));
    return length(point + position) - 0.25;
}


float sdfScene(vec3 point) {
    float time = u_time * 2.0;
    float coin = coin(point);
    float moon = moon(point);
    float orbiter = orbiter(point);

    return min(coin, min(moon, orbiter));
}

Material sdfTagMaterial(Ray ray, float distance, vec3 point) {
    float time = u_time * 2.0;
    Material result;
    float coin = coin(point);
    float moon = moon(point);
    float orbiter = orbiter(point);

    if (abs(moon) <= EPSILON) {
        // Light
        result = material(
            vec3(.6, .6, 1),
            vec3(1.2, 1.2, 1.2),
            .55
        );
    } else if (abs(orbiter) <= EPSILON) {
        // Orbiter
        result = material(
            vec3(.3, 0.2, 0.6),
            vec3(2, 2, 2),
            1.
        );
    } else if (abs(coin) < EPSILON) {
        // Gold
        result = material(
            vec3(.95, .7, .45),
            vec3(.0),
            .2
        );
    } else {
        // Skybox
        result = material(
            (.9 + .125 * sin(time * 0.5)) * 1.4 * mix(vec3(.25, .125, .125), vec3(.7, .8, 1), .5 + .5 * ray.direction.y),
            vec3(1, 1, 1),
            1.0
        );
    }

    

    return result;
}


////////////////////////////////////////////////
// Main tracing + marching loop
// Bounces, diffuse, emission, and reflections
vec3 cosineWeightedRandomHemisphereDirection(const vec3 n) {
	vec3  uu = normalize(cross(n, vec3(0.0, 1.0, 1.0)));
	vec3  vv = cross(uu, n);
	float ra = sqrt(random.y);
    float rb = 6.2831 * random.x;
	float rx = ra * cos(rb); 
	float ry = ra * sin(rb);
	float rz = sqrt( 1.0 - random.y);
	vec3  rr = vec3( rx * uu + ry * vv + rz * n );

    return normalize(rr);
}

vec3 computeNormal(vec3 point) {
    vec3 epsilon = vec3(EPSILON, 0.0, 0.0);

    float dx = sdfScene(point + epsilon.xyy) - sdfScene(point - epsilon.xyy);
    float dy = sdfScene(point + epsilon.yxy) - sdfScene(point - epsilon.yxy);
    float dz = sdfScene(point + epsilon.yyx) - sdfScene(point - epsilon.yyx);

    return normalize(vec3(dx, dy, dz));
}

Hit march(Ray ray) {
    Hit hit = noHit();

    for(int i = 0; i < MAX_STEPS; i++) {
    	vec3 pivot = ray.origin + ray.direction * hit.distance; 
        float distance = sdfScene(pivot);
        hit.distance += distance; 
        if(hit.distance > MAXDISTANCE || distance < .1 * TENTH_EPSILON) break;
    }

    hit.point += ray.origin + ray.direction * hit.distance;
    hit.normal = computeNormal(hit.point);
    hit.material = sdfTagMaterial(ray, hit.distance, hit.point);

    return hit;
}

vec3 bounces(Ray ray) {
    Hit hit = noHit();
    vec3 absortion[BOUNCES];
    vec3 emission[BOUNCES];
    int i = 0;

    for(i = 0; i < BOUNCES - 1 && hit.distance < MAXDISTANCE; i++) {
        shuffle();
        //hit = trace(ray);
        hit = march(ray);

        vec3 diffuse = cosineWeightedRandomHemisphereDirection(hit.normal);
        vec3 reflection = reflect(ray.direction, hit.normal);

        ray.direction = mix(reflection, diffuse, hit.material.roughness);
        ray.origin = hit.point + EPSILON * ray.direction;

        emission[i] = hit.material.emissive;
        absortion[i] = hit.material.color;
    }

    vec3 sampled = vec3(0);
    for (; i > 0; i--) {
        sampled += emission[i - 1];
        sampled *= absortion[i - 1];
    }

    return sampled;
}

void main() {
	time = u_time;
    initRandom(gl_FragCoord.xy, time);

    vec2 viewportPoint = viewport(gl_FragCoord.xy, u_resolution.xy);

    vec2 cameraWobble = vec2(
        .1 * cos(time * 1.2),
        .1 * sin(time * 1.2) + 1.5
    );

    Camera camera = camera(
        vec3(cameraWobble, 2),  // position
        vec3(0, 0.2, 0.),       // target
        0.05 * cos(time * 1.2), // roll
        u_resolution.xy
    );

	vec3 color = vec3(0.);

    for(int j = 0; j < SAMPLES; j++) {
        shuffle();
        Ray ray = cameraRay(camera, viewportPoint);
		color += bounces(ray);
	}
	
	fragColor = vec4(color / float(SAMPLES), 1.0);
}
```
