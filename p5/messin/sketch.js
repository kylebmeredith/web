var numFrames = 162;
var currentFrame = 0;
var frames = [];

var imgWidth = 800;

function pad(num, size){ 
    return ('000000000' + num).substr(-size); 
}

function loadFrames() {
    for (i=0; i<numFrames; i++) {
        frames.push(loadImage(`frames/fractal_${pad(i,5)}.png`));
    }
}

function preload() {
    loadFrames();
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(10, 10, 30);
}

function draw() {
    background(10, 10, 30);
    currentFrame = int(map(winMouseX, 0, windowWidth, 0, numFrames));
    
    image(frames[currentFrame],width/2 - imgWidth/2,height/2 - imgWidth/2, imgWidth, imgWidth);
}