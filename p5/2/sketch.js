// PRELOADED ASSETS
let kalShader;
let rippleShader;
let alphaShader;
let invertShader;
let fbnShader;

let img;
let overlay;


// CONTROLLABLES
let imgX;
let imgY;
let imgScale;

let kalX;
let kalY;
let slices;

let waveAmp;
let waveFreq;
let time;


// CONTROLS
let mx;
let my;
let distToText;


function preload(){
  // load the shaders
  kalShader = loadShader('base.vert', 'kal.frag');
  rippleShader = loadShader('base.vert', 'ripple.frag');
  alphaShader = loadShader('base.vert', 'alpha.frag');
  invertShader = loadShader('base.vert', 'invert.frag');
  
  fbnShader = loadShader('base.vert', 'fbn.frag');
  
//   img = loadImage('city.jpg');
  img = loadImage('/images/kalNoText.jpg')
}

function setup() {
  // shaders require WEBGL mode to work
  // at present time, there is no WEBGL mode image() function so we will make our createGraphics() in WEBGL, but the canvas renderer will be P2D (the default)
  createCanvas(windowWidth, windowHeight);
  noStroke();
  
  fbnPass = createGraphics(windowWidth, windowHeight, WEBGL);
  fbnPass.noStroke();
  
  kalPass = createGraphics(windowWidth, windowHeight, WEBGL);
  kalPass.noStroke();
  
//   overlayPass = createGraphics(windowWidth, windowHeight, WEBGL);
//   overlayPass.noStroke();
  
  ripplePass = createGraphics(windowWidth, windowHeight, WEBGL);
  ripplePass.noStroke();
  
  alphaPass = createGraphics(windowWidth, windowHeight, WEBGL);
  alphaPass.noStroke();
  
  invertPass = createGraphics(windowWidth, windowHeight, WEBGL);
  invertPass.noStroke();
}

function draw() {  
    background(0);
    // add click and drag!
    
    // .8, .75
    
    // update controls
    mx = map(winMouseX, 0, windowWidth, 0, 1);
    my = map(winMouseY, 0, windowHeight, 1, 0);
    distToText = dist(mx, my, .8, .25);
    
    
    // update controllables
    // let imgScale = map(mx, 0., 1., 1., 50.);
    imgScale = 1.0;
    imgY = 0.0;
    
    // fix this so it's always in the right spot!!!
    imgX = mx * width/height - (10/width);
    
    kalX = mouseIsPressed ? ((1.0-mx) - .5) : ((mx) - 0.5) * .2;
    kalY = mouseIsPressed ? ((1.0-my) - .5) : ((my) - 0.5) * .2;
    
    slices = int(rangeMap(distToText, .1, .8, 2, 70, true));
    // slices = int(rangeMap(mx, 0, .8, 70, 2, true));
    slices = mouseIsPressed ? 10000 : slices;
    
    waveAmp = rangeMap(distToText, .1, 1, 0, 0.08, true);
    waveFreq = rangeMap(distToText, .1, 1, 50, 200, false);
    
    
    
    kalPass.shader(kalShader);
    kalShader.setUniform('texRes', [width, height]);
    
    kalShader.setUniform('tex', img);
    kalShader.setUniform('Scale', imgScale);
    kalShader.setUniform('Offset', [imgX, imgY]);
    kalShader.setUniform('Origin', [kalX, kalY]);
    kalShader.setUniform('Div', slices);
    kalShader.setUniform('Angle', 0.0);
    kalShader.setUniform('Rotate', 0.0);
    
    kalPass.rect(0,0,width, height);
    

    ripplePass.shader(rippleShader);
    
    rippleShader.setUniform('texRes', [width, height]);
    rippleShader.setUniform('origin', [kalX, kalY]);
    rippleShader.setUniform('waveFreq', waveFreq);
    rippleShader.setUniform('waveAmp', waveAmp);
    rippleShader.setUniform('tex0', kalPass);
    
    ripplePass.rect(0,0,width, height);
    
    // blendMode(DODGE);
    // image(kalPass,0,0,width,height);
    // image(ripplePass, 0,0, width, height);
    
    invertPass.shader(invertShader);
    invertShader.setUniform('tex', ripplePass);
    invertPass.rect(0,0,width, height);
    
    image(invertPass,0,0,width,height);
    
    
    let amount = rangeMap(distToText, .1, .3, 1, 0, true);
    
    alphaPass.shader(alphaShader);
    alphaShader.setUniform('tex', ripplePass);
    alphaShader.setUniform('texRes', [width, height]);
    alphaShader.setUniform('point', [mx, my]);
    alphaShader.setUniform('radius', .2);
    alphaShader.setUniform('amount', amount);
    
    alphaPass.rect(0,0,width,height);
    
    // filter(INVERT);
    image(alphaPass,0,0,width,height);
    
    
    // let overlayAmount = map(my, .2, 1., 0., 1.);
    // clamp(overlayAmount, 0., 1.);
    
    // overlayPass.shader(overlayShader);
    
    // overlayShader.setUniform('tex0', kalPass);
    // overlayShader.setUniform('tex1', overlay);
    // overlayShader.setUniform('amt', overlayAmount);
    
    // overlayPass.rect(0,0,width, height);
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}