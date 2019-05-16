// in this sketch we're going to send the webcam to the shader, and then invert it's colors

// PRELOADED ASSETS
let dispShader;
let fbnShader;

let targetImg;
let dispImg;
let background;

let textImg;


// CONTROLLABLES
let st_scale = 5;
let rx_scale = 1;
let ry_scale = 1;

let qx_step = 1;    // half color movement
let rx_step = 1;
let ry_step = 1;

let lacunarity = 2.0;
let gain = .5;

let diag1 = 0.5;  // rotation matrices
let diag2 = 0.5; 

let half1;
let half2;
let halfMix = 1;
let whole1;
let whole2;


let dispScale = .15;
let currentFrame;
let thresh = .01;
let bgFade = 0;


// CONTROLS
let mx;
let my;
let distToText;


// FRAME INFO
let frames = [];
let numFrames = 77;


function pad(num, size){ 
    return ('00000' + num).substr(-size); 
}

function loadFrames() {
    for (i=0; i<numFrames; i++) {
        frames.push(loadImage(`fractal/fractal_${pad(i,3)}.jpg`));
    }
}

function preload(){
    // load the shaders
    dispShader = loadShader('base.vert', 'displace.frag');
    fbnShader = loadShader('base.vert', 'fbn.frag');
    alphaShader = loadShader('base.vert', 'alpha.frag');

    targetImg = loadImage('/images/grid.jpg');
    //targetImg = loadImage('/images/me in bluish color map.jpg');
    background = loadImage('/images/grid.jpg');
    
    textImg = loadImage('/images/find the text white.png');
  
    loadFrames();
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    noStroke();
    
    dispPass = createGraphics(windowWidth, windowHeight, WEBGL);
    fbnPass = createGraphics(windowWidth, windowHeight, WEBGL);
    alphaPass = createGraphics(windowWidth, windowHeight, WEBGL);
    
    textBuffer = createCanvas(windowWidth, windowHeight);
        
    dispPass.noStroke();
    fbnPass.noStroke();
}

function draw() {  
    
    // update control values
    mx = map(winMouseX, 0, windowWidth, 0, 1);
    my = map(winMouseY, 0, windowHeight, 1, 0);
    
    let distToText = dist(mx, my, .1, .8);
    
    fill(0);
    rect(0,0,width,height);
    // background(0);


    // update fbn controllables
    qx_step = rangeMap(my, 0, 1, 0, -3, false);    
    rx_step = rangeMap(mx, 0, 1, 0, 15, false);
    ry_step = rangeMap(mx, 0, 1, 0, 50, false);
    
    translate_x = rangeMap(mx, 0, 1, -.2, .2);
    st_scale_min = rangeMap(my, 0, 1, 30, .1, false);
    st_scale_max = rangeMap(my, 0, 1, .1, 15, false);
    // st_scale = rangeMap(my, 0, 1, 1, 10, false);
    // rx_scale = rangeMap(mx, 0, 1, 1, 30, false);        // this one is sick!
    // ry_scale = rangeMap(my, 0, 1, 1, 30, false);
    
    // lacunarity = rangeMap(mx, 0, 1, 2, 5, false);
    
    // bigger = brighter and more distortion. Great between .4 and .8
    // gain = rangeMap(my, 0, 1, .4, .8, false);      
    
    // causes crazy turbulence
    // from top left -> bottom right to top right -> bottom left
    let offset = rangeMap(mx, 0, 1, 1.57, 3.14 * 1.5, false);
    offset = 0;
    diag1 = .5 + offset;   
    diag2 = .5 - offset;   // these cancel each other out. 
    
    halfMix = rangeMap(mx, 0, 1, .1, 1.5, false);
    
    
    fbnPass.shader(fbnShader);
    
    fbnShader.setUniform('u_resolution', [width, height]);
    
    fbnShader.setUniform('diag1', diag1);
    fbnShader.setUniform('diag2', diag2);
    
    fbnShader.setUniform('qx_step', qx_step);
    fbnShader.setUniform('rx_step', rx_step);
    fbnShader.setUniform('ry_step', ry_step);
    
    fbnShader.setUniform('translate', [translate_x, 0]);
    fbnShader.setUniform('st_scale_min', st_scale_min);
    fbnShader.setUniform('st_scale_max', st_scale_max);
    // fbnShader.setUniform('st_scale', st_scale);
    // fbnShader.setUniform('rx_scale', rx_scale);
    fbnShader.setUniform('ry_scale', ry_scale);
    
    fbnShader.setUniform('lacunarity', lacunarity); // bigger = noisier
    // fbnShader.setUniform('gain', gain);             
    
    fbnShader.setUniform('half1', [1, 0, 0]);
    fbnShader.setUniform('half2', [0, 1, 1]);
    fbnShader.setUniform('halfMix', halfMix);
    fbnShader.setUniform('whole1', [0, 0, .5]);     // dark
    fbnShader.setUniform('whole2', [.8, 1, 1]);     // bright
    
    fbnPass.rect(0,0,width,height);
    
    
    
    let lumaHi = rangeMap(distToText, .075, .2, 1.05, 0, true);
    
    alphaPass.shader(alphaShader);

    alphaShader.setUniform('tex', fbnPass);
    alphaShader.setUniform('texRes', [width,height]);
    alphaShader.setUniform('lum', [lumaHi, 1.]);
    
    alphaPass.rect(0,0,width,height);
    
    
    
    
    
    // update disp controllables
    currentFrame = int(rangeMap(mx, 0, 1, 0, numFrames, true));
    dispImg = frames[currentFrame];
    
    dispScale = rangeMap(my, 0, 1, 0, 0.2, false);
    bgFade = rangeMap(mx, 0, 1, 0, 1, false);
    
    // bgFade = mouseIsPressed ? 1 : 0;
    bgFade = 1;
    // thresh = rangeMap(mx, 0, 1, 0, 1, false);

    //shader() sets the active shader with our shader
    dispPass.shader(dispShader);

    dispShader.setUniform('tex0', dispImg);
    dispShader.setUniform('tex1', alphaPass);  // image to be displaced
    dispShader.setUniform('background', background);
    dispShader.setUniform('dispScale', dispScale);
    dispShader.setUniform('bgFade', bgFade);
    dispShader.setUniform('thresh', thresh);
    
    dispPass.rect(0,0,width,height);
    
    
    
    
    
    // textBuffer.image(textImg, .1, .1, 100, 300);
    
    
    // blendMode(DIFFERENCE);
    
    // image(alphaPass,0,0,width,height);
    
    if (mouseIsPressed) {
        image(dispPass,0,0,width,height);
    } else {
        image(alphaPass,0,0,width,height);
    }
    // 
    // image(textBuffer,0,0,width,height);
    
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}