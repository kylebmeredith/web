precision mediump float;

// lets grab texcoords just for fun
varying vec2 vTexCoord;

// our texture and image coming from p5
uniform sampler2D tex0; // base
uniform sampler2D tex1; // overlay

uniform sampler2D background;

// how much to displace by (controlled by mouse)
uniform float amt;

void main() {

  vec2 uv = vTexCoord;
  // the texture is loaded upside down and backwards by default so lets flip it
//   uv = 1.0 - uv;

  vec4 baseColor = texture2D(tex0, uv);
  vec4 overlayColor = texture2D(tex1, uv);
  
  
  vec4 color = baseColor / (overlayColor);
  color = mix(baseColor, color, amt);

  // lets get the average color of the rgb values
//   float avg = dot(dispColor.rgb, vec3(0.33333));

  
  // output the image
  gl_FragColor = color;
}