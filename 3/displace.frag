precision mediump float;

// lets grab texcoords just for fun
varying vec2 vTexCoord;

// our texture and image coming from p5
uniform sampler2D tex0;
uniform sampler2D tex1;

uniform sampler2D background;

uniform float thresh;

uniform float bgFade; // background fade

// how much to displace by (controlled by mouse)
uniform float dispScale;

void main() {

  vec2 uv = vTexCoord;
  // the texture is loaded upside down and backwards by default so lets flip it
  uv.t = 1.0 - uv.t;

  // get the webcam as a vec4 using texture2D
  vec4 dispColor = texture2D(tex0, uv);

  // lets get the average color of the rgb values
  float avg = dot(dispColor.rgb, vec3(0.33333));

  // then spread it between -1 and 1
//   avg = avg * 2.0 - 1.0;

  // we will displace the image by the average color times the dispScale of displacement 
  float disp = avg * dispScale;

  // displacement works by moving the texture coordinates of one image with the colors of another image
  // add the displacement to the texture coordinages
    // vec4 backgroundColor = texture2D(background, uv);
  
//   vec4 color = vec4(0., coord.x, coord.y, 1.);
  vec4 color = texture2D(tex1, fract(uv + disp));
  
  // step(.1, avg)
  color = mix(color, color*vec4(step(.1,avg)), bgFade);
//   color = vec4(0.);
  
//   color = mix(color, backgroundColor, 1.0-step(.1, color.r));
  

  // output the image
  gl_FragColor = color;
}