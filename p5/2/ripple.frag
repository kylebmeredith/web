// <jittershader name="ripples">
// 	<param name="waveFreq" type="float" default="100" />
// 	<param name="waveAmp" type="float" default="0.03" />
// 	<param name="time" type="float" default="1" />
// 	<language name="glsl" version="1.0">
// 		<bind param="waveFreq" program="ripples" />
// 		<bind param="waveAmp" program="ripples" />
// 		<bind param="time" program="ripples" />
// 		<program name="basic" type="vertex" source="sh.passthrudim.vp.glsl" />
// 		<program name="ripples" type="fragment">
// <![CDATA[

precision mediump float;

// vertex to fragment shader io
varying vec2 vTexCoord; 
uniform vec2 texRes;

// globals
uniform float waveFreq;
uniform float waveAmp;
uniform float time;

uniform vec2 origin;

// samplers
uniform sampler2D tex0;

// entry point
void 
main()
{
    vec2 aspect = vec2(texRes.x/texRes.y, 1.0);
    // vec2 point = vTexCoord.st * aspect;
    
    // flip the y axis
    vec2 point = vec2(vTexCoord.s, 1.0-vTexCoord.t) * aspect;
    
    // vec2 PP = texcoord0/texdim0 - vec2(0.5,0.5);
    vec2 PP = point - (0.5 * aspect);
    float P0 = PP[0];
    float P1 = PP[1];
    float radius = sqrt(P0 * P0 + P1 * P1);
    float cosangle = P0 / radius;
    float sinangle = P1 / radius;

    float waveangle = (radius - time) * waveFreq;
    waveangle = mod(waveangle, 2.0 * 3.14159);
    float offset = 1.0 - cos(waveangle - 3.14159);
    offset *= waveAmp;

    float newradius = radius + offset;
    vec2 newP = vec2 (newradius * cosangle + (0.5*aspect.x),newradius * sinangle + 0.5);

    gl_FragColor = texture2D(tex0, newP / aspect);
}
