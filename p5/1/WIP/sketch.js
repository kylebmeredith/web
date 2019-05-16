// in this sketch the camera image will be distorted by using a sine wave function in the shader

let blurShader;
let colormapShader;
let img;

let blurSize;

let freq;
let mix;

let fadeSpeed;

let mx;
let my;

function preload(){
  // load the shaders
  blurH = loadShader('base.vert', 'blur.frag');
  blurV = loadShader('base.vert', 'blur.frag');
  colormapShader = loadShader('base.vert', 'colormap.frag');
  
//   img = loadImage('caves.jpg');
  img = loadImage('mosque.jpg');
//   img = loadImage('city.jpg');
}

function setup() {
  // shaders require WEBGL mode to work
  // at present time, there is no WEBGL mode image() function so we will make our createGraphics() in WEBGL, but the canvas renderer will be P2D (the default)
  createCanvas(windowWidth, windowHeight);
  noStroke();
  
  blurPass1 = createGraphics(windowWidth, windowHeight, WEBGL);
  blurPass2 = createGraphics(windowWidth, windowHeight, WEBGL);
  
  colormapPass = createGraphics(windowWidth, windowHeight, WEBGL);
  
  blurPass1.noStroke();
  blurPass2.noStroke();
  colormapPass.noStroke();
}

function clamp(val, min, max) {
    if (val > max) {
        val = max;
    } else if (val < min) {
        val = min;
    }
    return val;
}

function draw() {  
    // clear();
    
    mx = map(winMouseX, 0, windowWidth, 1, 0);
    my = map(winMouseY, 0, windowHeight, 0, 1);
    
    blurSize = map(my, 0., .8, 10., 0.);
    blurSize = clamp(blurSize, 0., 10.);
    
    freq = map(mouseX, 0, width, 1.0, 100.0);
    mix = 1.0;
    // mix = map(mouseY, 0, height, 1.0, 0.0);
    
    blurSize = mouseIsPressed ? 0 : blurSize;
    mix = mouseIsPressed ? 0 : mix;
    
    // fadeSpeed = .1;
    
    // if (mouseIsPressed) {
    //     if (blurSize > 0) {
    //         blurSize -= fadeSpeed;
    //     }
    //     if (mix > 0) {
    //         mix -= fadeSpeed;
    //     }
    // }
    
    blurPass1.shader(blurH);
    
    // send the camera texture to the horizontal blur shader
    // send the size of the texels
    // send the blur direction that we want to use [1.0, 0.0] is horizontal
    blurH.setUniform('tex0', img);
    blurH.setUniform('texelSize', [1.0/width, 1.0/height]);
    blurH.setUniform('direction', [1.0, 0.0]);
    blurH.setUniform('size', blurSize);
    
    // we need to make sure that we draw the rect inside of pass1
    blurPass1.rect(0,0,width, height);
    
    
    blurPass2.shader(blurV);
    
    // instead of sending the webcam, we will send our first pass to the vertical blur shader
    // texelSize remains the same as above
    // direction changes to [0.0, 1.0] to do a vertical pass
    blurV.setUniform('tex0', blurPass1);
    blurV.setUniform('texelSize', [1.0/width, 1.0/height]);
    blurV.setUniform('direction', [0.0, 1.0]);
    blurV.setUniform('size', blurSize);
    
    blurPass2.rect(0,0,width, height);
    
    // image(blurPass2, 0,0, width, height);
    
    
    
   // shader sets the active shader with our shader
    colormapPass.shader(colormapShader);

  // lets just send the cam to our shader as a uniform
  colormapShader.setUniform('tex', blurPass2);
  
  // send the two values to the shader
  colormapShader.setUniform('freq', freq);
  colormapShader.setUniform('effect_mix', mix);
  
  colormapShader.setUniform('aspect', width/height);
  colormapShader.setUniform('mouse', [mx, my]);

    // rect gives us some geometry on the screen
    colormapPass.rect(0,0,width, height);

    image(colormapPass, 0,0, width, height);
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}