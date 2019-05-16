// PRELOADED ASSETS
let blurShader;
let colormapShader;
let img;

// CONTROLLABLES
let blurSize;
let freq;
let mix;
let erase;

// CONTROL VALUES
let mx;
let my;
let distToText;

// TEXT VARIABLES
let findText
let findTextWidth;
let findTextHeight;

let clickText
let clickTextWidth;
let clickTextHeight;

function preload(){
  // load the shaders
  blurH = loadShader('https://drive.google.com/open?id=1ESVSHvO3sXAMFrJYodKqAoEReq6HxX21', 'https://drive.google.com/open?id=1ELuYfH3Sc4HdR0s8NAhJzlki4LbaEf-v');
  blurV = loadShader('https://drive.google.com/open?id=1ESVSHvO3sXAMFrJYodKqAoEReq6HxX21', 'https://drive.google.com/open?id=1ELuYfH3Sc4HdR0s8NAhJzlki4LbaEf-v');
  colormapShader = loadShader('https://drive.google.com/open?id=1ESVSHvO3sXAMFrJYodKqAoEReq6HxX21', 'https://drive.google.com/open?id=1Ec2pUkbe7W1_KL4hxeIXRyi_aovCg6La');
  
  // load the images
  img = loadImage('https://drive.google.com/open?id=1FFQSg6hXHYaf4Y6_-DZNKVdV83ohNt0V');
  
//   findText = loadImage('/images/find the text white.png');
//   clickText = loadImage('/images/click for next white.png');
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
  
  
//   textAlign(CENTER, CENTER);
//   textFont('ZCOOL XiaoWei');
  
  // set text variables
  findTextWidth = 200;
  findTextHeight = findTextWidth * (findText.height / findText.width);
  findTextY = .25;
  
  clickTextWidth = 150;
  clickTextHeight = clickTextWidth * (clickText.height / clickText.width);
  clickTextY = .5;
  
}


function draw() {  
    // clear();
    // if (mouseIsPressed) blendMode(SUBTRACT); // very cool
    // else blendMode(BLEND);
    
    
    // update control values 
    mx = map(winMouseX, 0, windowWidth, 1, 0);
    my = map(winMouseY, 0, windowHeight, 0, 1);
    distToText = dist(mx, my, .5, clickTextY);
    
    // update uniform values
    blurSize = rangeMap(my, 0, .8, 8, 0, true);
    blurSize = mouseIsPressed ? 0 : blurSize;
    
    freq = rangeMap(mx, 0, 1, 1, 100, false);
    
    mix = mouseIsPressed ? 0 : 1.0;
    // mix = map(mouseY, 0, height, 1.0, 0.0);
    
    erase = rangeMap(distToText, .1, .15, 10, 0, true);
    
    
    blendMode(BLEND);
    fill(0, erase);
    rect(0,0,width,height);
    
    // image(clickText, width/2-clickTextWidth/2, height*clickTextY, clickTextWidth, clickTextHeight);
    
    
    
    blurPass1.shader(blurH);
    
    // send the img to the horizontal blur shader
    // send the size of the texels
    // send the blur direction that we want to use [1.0, 0.0] is horizontal
    blurH.setUniform('tex0', img);
    blurH.setUniform('texelSize', [1.0/width, 1.0/height]);
    blurH.setUniform('direction', [1.0, 0.0]);
    blurH.setUniform('size', blurSize);
     
    // draw geometry for the shader
    blurPass1.rect(0,0,width, height);
    // blurPass1.text("Find the text, click for next", width/2, height/2);
    // blurPass1.image(text, width/2-textWidth/2, height/2-textHeight/2, textWidth, textHeight);
    

    blurPass2.shader(blurV);
    
    // instead of sending the img, we will send our first pass to the vertical blur shader
    // texelSize remains the same as above
    // direction changes to [0.0, 1.0] to do a vertical pass
    blurV.setUniform('tex0', blurPass1);
    blurV.setUniform('texelSize', [1.0/width, 1.0/height]);
    blurV.setUniform('direction', [0.0, 1.0]);
    blurV.setUniform('size', blurSize);
    
    blurPass2.rect(0,0,width, height);
    
    
    
    // shader sets the active shader with our shader
    colormapPass.shader(colormapShader);

    // send the blurred image to the colormap shader
    colormapShader.setUniform('tex', blurPass2);
  
    // send the two values to the shader
    colormapShader.setUniform('freq', freq);
    colormapShader.setUniform('effect_mix', mix);
    colormapShader.setUniform('aspect', width/height);
    colormapShader.setUniform('mouse', [mx, my]);

    // rect gives us some geometry on the screen
    colormapPass.rect(0,0,width, height);
    
    image(colormapPass, 0,0, width, height);
    
    fill(255);
    textSize(17);
    strokeWeight(1.0);
    
    // let jitterScale = map(distToText, .1, 1.0, 0, 10);
    // jitterScale = 0;
    // jitterScale = clamp(jitterScale, 0, 20);
    
    // draw the text on top
    
    // blendMode(DIFFERENCE);
    // image(findText, width/2-findTextWidth/2, height*findTextY, findTextWidth+1, findTextHeight+3);
    // blendMode(NORMAL);
    // image(findText, width/2-findTextWidth/2, height*findTextY, findTextWidth, findTextHeight);
    
    // text("Find the text, click for next", width/2 + noise(winMouseX)*jitterScale, height/2 + noise(winMouseY)*jitterScale);
    // image(img,0,0,width/2,height/2);
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}