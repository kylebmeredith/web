// Author @patriciogv - 2015
// http://patriciogonzalezvivo.com

#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform vec2 u_resolution;
// uniform vec2 u_mouse;
// uniform float u_time;


uniform vec2 translate;
uniform float st_scale_min;
uniform float st_scale_max;
// uniform float st_scale;
// uniform float rx_scale;
uniform float ry_scale;

uniform float qx_step;
uniform float rx_step;
uniform float ry_step;

uniform float lacunarity;
// uniform float gain;

uniform float diag1;
uniform float diag2;

// bottom, top, diffuse1, diffuse2
uniform vec3 half1;
uniform vec3 half2;
uniform float halfMix;

uniform vec3 whole1;
uniform vec3 whole2;

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define NUM_OCTAVES 5

float fbm ( in vec2 _st) {
    float gain=mix(.4,.7,vTexCoord.s);
    
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(diag1),
                    -sin(diag2), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
        _st = rot * _st * lacunarity + shift;
        a *= gain;
    }
    return v;
}

void main() {
    // vec2 st = vTexCoord.st/u_resolution.xy* scale;
    vec2 aspect = vec2(u_resolution.x/u_resolution.y, 1.0);
    
    float st_scale = mix(st_scale_min, st_scale_max, vTexCoord.t);
    // st_scale = mix(st_scale, st_scale * 2., vTexCoord.s);
    
    float rx_scale = mix(1., 15., 1.0-vTexCoord.t);
    // rx_scale = 1.;
    
    vec2 st = (.5-vTexCoord.st + translate) * aspect * st_scale;  // add a scale uniform
    
    
    vec3 color = vec3(0.0);

    vec2 q = vec2(0.);
    q.x = fbm( st + 1.0*qx_step);
    q.y = fbm( st + vec2(1.0));

    vec2 r = vec2(0.);
    r.x = fbm( st + rx_scale*q + vec2(1.7,9.2)+ 0.15*rx_step );   // movement
    r.y = fbm( st + ry_scale*q + vec2(8.3,2.8)+ 0.126*ry_step);   // overlay

    float f = fbm(st+r);

    
    // four colors: bottom, top, diffuse1, diffuse2
    
    float halfMix = mix(0.,2., st.t);
    
    color = mix(half1, 
                half2,	 
                clamp((f*f)*halfMix,0.0,1.0));
	
    // good to have one of these dark and one light
    color = mix(color,
                whole1,	  	
                clamp(length(q),0.0,1.0));

    color = mix(color,
                whole2,  
                clamp(length(r.x),0.0,1.0));

    gl_FragColor = vec4((f*f*f+.6*f*f+.5*f)*color,1.);
}