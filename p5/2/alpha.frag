// #ifdef GL_ES
precision highp float;
// #endif

// lets grab texcoords just for fun
varying vec2 vTexCoord;

uniform sampler2D tex;

uniform vec2 point; // mouse
uniform float amount;
uniform float radius;

uniform vec2 texRes;

float map(in float value, in float min, in float max, in float new_min, in float new_max, in bool clamp) {
    float new_val = new_min + (value - min) * (new_max - new_min) / (max - min);
    if (clamp) {
        if (new_val < new_min) {
            new_val = new_min;
        } else if (new_val > new_max) {
            new_val = new_max;
        }
    }
    return new_val;
}

void main() {
    vec2 aspect = vec2(texRes.x/texRes.y, 1.0);
    
    vec2 uv = vTexCoord.st;
    
    float dist = distance(uv * aspect, point * aspect);
    
    // -.5 makes an inner circle of white
    float a = map(dist, 0., radius, -.5, 1.0, false);
    
    a = mix(1.0, a, amount);
    
    // reverse the y axis for the texture
    vec2 texUV = vec2(uv.s, 1.0-uv.t);
    
    gl_FragColor = vec4(texture2D(tex, texUV).rgb, a);
}