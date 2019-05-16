// #ifdef GL_ES
precision highp float;
// #endif

// lets grab texcoords just for fun
varying vec2 vTexCoord;

uniform sampler2D tex;
// uniform vec2 texRes;

void main() {
    // vec2 aspect = vec2(texRes.x/texRes.y, 1.0);
    vec2 uv = vTexCoord.st;
    // reverse the y axis for the texture
    vec2 texUV = vec2(uv.s, 1.0-uv.t);
    
    vec3 c = texture2D(tex, texUV).rgb;
    
    float freq = 100.;
    vec3 newC = vec3(sin(c.r * freq), sin(c.g * freq), sin(c.b * freq));
    
    gl_FragColor = vec4(newC.r+newC.g+newC.b, newC.r*.5 + newC.g+newC.b, newC.g+newC.b, 1.);
}