// precision mediump float;

// #ifdef GL_ES
precision highp float;
// #endif

// lets grab texcoords just for fun
varying vec2 vTexCoord;

// our texture coming from p5
uniform sampler2D tex;

uniform float freq;
uniform float effect_mix;

uniform vec2 mouse;
uniform float aspect;

vec3 rgb2hsb( in vec3 c ){
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz),
                 vec4(c.gb, K.xy),
                 step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r),
                 vec4(c.r, p.yzx),
                 step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)),
                d / (q.x + e),
                q.x);
}

vec3 hsb2rgb( in vec3 c ){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0, 0.0, 1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix( vec3(1.0), rgb, c.y);
}

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

float variableExponent(float val, float dist) {
    // float mod;
    // if (useY) mod = mouseY;
    // else mod = mouseX;
    // float seed = 1.0 - mouse.x;
    // float seed = 1.0 - m;
    float exp = mix(-.5, 10., 1.0 - mouse.x);
    float freq = mix(-50., 50., mouse.y);
    
    // dist * x, x increases frequency
    // return mod(val + pow(dist * 15., exp), 0.1);    
    return (sin(val + pow((dist+.2) * 15., exp)) * .5);  
}

void main()
{
// 	original rgb
	vec2 uv = vTexCoord.st;
	uv = 1.0 - uv;
	
	vec3 rgb = texture2D(tex, uv).rgb;
	float a = texture2D(tex, uv).a; 
    vec3 hsb = rgb2hsb( rgb );

    float dist = distance(uv * vec2(aspect, 1.0), mouse * vec2(aspect, 1.0));

    // remap hue
    hsb.x = sin(hsb.x * freq) / 2.0 + 0.5;
    
    // change saturation
    // hsb.y =  variableExponent(hsb.y, dist) * 10.;
    hsb.y += .5;
    hsb.z += .5;
    
    // float hKey = mouse.y;
    // float tol = (1.0 - mouse.x) * .9;
    // if (hsb.x > hKey - tol && hsb.x < hKey + tol) {
    //     a = 0.;
    // } 
    // a = mix(a, 1., dist * 3.0);
    
    // float diff = dot(rgb, vec3(.3, .3, .3));
    
    // if (diff < .2) {
    //     a = 0.;
    // }
    
    // a = sin(hsb.x);
    
    // change alpha
    // a = sin(hsb.x * freq) / 2.0 + 0.8;
    a = variableExponent(a, dist) * 5.;
    // a = variableExponent(a, dist) * 10.;
    
    // if hsb.
    
    // a = smoothstep(0., 3.0, dist);
    a = map(dist, 0., .45, -.5, 1.0, false);    // circle around mouse 
    

    vec3 new_rgb = hsb2rgb(hsb);
    vec3 mixed = mix(rgb, new_rgb, effect_mix);
    // vec3 mixed = mix(rgb, new_rgb, a * .5 + .5);  // wild
    
    // gl_FragColor = texture2D(tex, uv.st);
    // a = 1.0;

    gl_FragColor = vec4(vec3(mixed.r, mixed.g, mixed.g*.9 + mixed.b), a);

    // gl_FragColor = vec4(0., 0., 1., 1.);
}