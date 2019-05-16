// precision mediump float;

// #ifdef GL_ES
precision highp float;
// #endif

// lets grab texcoords just for fun
varying vec2 vTexCoord;
uniform vec2 texRes;

// our texture coming from p5
uniform sampler2D tex;

uniform vec2 mouse;

uniform vec2 Scale;
uniform vec2 Offset;
uniform vec2 Origin;
uniform float Div;
uniform float Angle;
uniform float Rotate;

const float pi=3.1415926;

void main()
{
    vec2 aspect = vec2(texRes.x/texRes.y, 1.0);
    
	vec2 point = vTexCoord.st * aspect;
// 	point = vTexCoord.st;
	vec2 dt = point - (0.5 - Origin) * aspect;
// 	vec2 dt = point - 0.5;
	float radius = sqrt(dot(dt,dt));
	float theta = atan(dt.y,dt.x)+pi;
	theta += Angle;
	float phi = pi/Div;

	float modtheta = mod(abs(theta),phi*2.);
	float foldtheta = (phi+Rotate)-abs(modtheta-phi);

	vec2 res = vec2(1.0);
	
	vec2 no = vec2(-cos(foldtheta) * radius, -sin(foldtheta) * radius);
	no = (no + 0.5) * res;
	
// 	vec2 off = abs((no + Offset + res)*Scale);
	vec2 off = abs((no + Offset + res) * 1.);
	vec2 modoff = mod(off, res *2.);
	vec2 fold = res - abs(modoff-res);  // fold is zero!
	
	
// 	vec4 leftTint = vec4(0., .5, .9, 1.);
	vec4 leftTint = vec4(0., 1.0-vTexCoord.s, 1.3-vTexCoord.t, 1.);
// 	vec4 rightTint = vec4(.8, .3, .1, 1.);
	vec4 rightTint = vec4(vTexCoord.t, 0., 1.0-vTexCoord.s, 1.);
	
	float gain = .2;
	
	if (mod(floor(theta/phi*2.), 2.0) == 1.) {
	   // gl_FragColor = texture2D(tex,fold);
		gl_FragColor = texture2D(tex,fold) * (leftTint + vec4(gain));
	} else {
		gl_FragColor = texture2D(tex,fold) * (rightTint + vec4(gain));
	}

// 	gl_FragColor = texture2D(tex,fold);
}
