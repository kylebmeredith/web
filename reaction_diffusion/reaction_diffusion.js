'use strict';

var font;
function preload() {
  // Ensure the .ttf or .otf font stored in the assets directory
  // is loaded before setup() and draw() are called
  font = loadFont('SourceSansPro-Regular.otf');
}


// framebuffer
var fbo;

// tex-struct (ping-pong)
var tex = 
{
  src : null,
  dst : null,
  swap : function(){
    var tmp = this.src;
    this.src = this.dst;
    this.dst = tmp;
  }
};

// shader
var shaderfiles = {};
var shader_grayscott;
var shader_display;

// offscreen resolution scale factor.
var SCREEN_SCALE = 1.0; 

// reaction diffusion settings and presets
var rdDef = {
  name    : 'ReactionDiffusion',
  da      : 1.0,
  db      : 0.6,
  feed    : 0.015,
  kill    : 0.05,
  dt      : 1.0,
  iter    : 5,
  reset   : initRD,
  preset0 : function() {  this.feed = 0.040; this.kill = 0.060; this.da = 1.00; this.db = 0.60; },
  preset1 : function() {  this.feed = 0.034; this.kill = 0.059; this.da = 1.00; this.db = 0.60; },
  preset2 : function() {  this.feed = 0.080; this.kill = 0.060; this.da = 1.00; this.db = 0.40; },
  preset3 : function() {  this.feed = 0.015; this.kill = 0.050; this.da = 1.00; this.db = 0.60; },
  preset4 : function() {  this.feed = 0.072; this.kill = 0.062; this.da = 0.50; this.db = 0.25; },
  preset5 : function() {  this.feed = 0.071; this.kill = 0.063; this.da = 0.40; this.db = 0.20; },
  preset6 : function() {  this.feed = 0.023; this.kill = 0.052; this.da = 0.50; this.db = 0.50; },
  preset7 : function() {  this.feed = 0.029; this.kill = 0.056; this.da = 0.60; this.db = 0.46; },
};

function setup() { 
  pixelDensity(1);
  
  // webgl canvas
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  // create gui (dat.gui)
  var gui = new dat.GUI();
  gui.add(rdDef, 'name');
  gui.add(rdDef, 'da'   , 0, 1  ).listen();
  gui.add(rdDef, 'db'   , 0, 1  ).listen();
  gui.add(rdDef, 'feed' , 0.01, 0.09).listen();
  gui.add(rdDef, 'kill' , 0.01, 0.09).listen();
  gui.add(rdDef, 'dt'   , 0, 1);
  gui.add(rdDef, 'iter' , 1, 10);
  gui.add(rdDef, 'preset0');
  gui.add(rdDef, 'preset1');
  gui.add(rdDef, 'preset2');
  gui.add(rdDef, 'preset3');
  gui.add(rdDef, 'preset4');
  gui.add(rdDef, 'preset5');
  gui.add(rdDef, 'preset6');
  gui.add(rdDef, 'preset7');
  gui.add(rdDef, 'reset'  );
  
  // webgl context
  var gl = this._renderer.GL;
  
 	// webgl version (1=webgl1, 2=webgl2)
  var VERSION = gl.getVersion();
  
  console.log("WebGL Version: "+VERSION);

  gl.newExt(gl.getSupportedExtensions(), true);
  
  // create FrameBuffer for offscreen rendering
  fbo = gl.newFramebuffer();

  // create Textures for multipass rendering
  var def = {
     target   : gl.TEXTURE_2D
    ,iformat  : gl.RGBA32F
    ,format   : gl.RGBA
    ,type     : gl.FLOAT
    ,wrap     : gl.CLAMP_TO_EDGE
    ,filter   : [gl.NEAREST, gl.LINEAR]
  }
  var tex_w = ceil(width * SCREEN_SCALE);
  var tex_h = ceil(height * SCREEN_SCALE);
  tex.src = gl.newTexture(tex_w, tex_h, def);
  tex.dst = gl.newTexture(tex_w, tex_h, def);
	
  // Shader source, depending on available webgl version
  // var fs_grayscott = document.getElementById("webgl"+VERSION+".fs_grayscott").textContent;
  // var fs_display   = document.getElementById("webgl"+VERSION+".fs_display"  ).textContent;
	
  var fs_grayscott = shaderfiles["webgl"+VERSION+".fs_grayscott"];
  var fs_display   = shaderfiles["webgl"+VERSION+".fs_display"];
  // create Shader
  shader_grayscott = new Shader(gl, {fs:fs_grayscott});
  shader_display   = new Shader(gl, {fs:fs_display  });
  // place initial samples
  initRD(); 
}

function windowResized() {
	if(!fbo) return;
  var w = windowWidth;
  var h = windowHeight;
  resizeCanvas(w, h);
  
  var tex_w = ceil(w * SCREEN_SCALE);
  var tex_h = ceil(h * SCREEN_SCALE);
  
  tex.src.resize(tex_w, tex_h);
  tex.dst.resize(tex_w, tex_h);  
  initRD();
}

// shading colors
var pallette = [
  1.00, 1.00, 1.00,
  0.00, 0.40, 0.80,
  0.20, 0.00, 0.20,
  1.00, 0.80, 0.40,
  0.50, 0.25, 0.12,     
  0.50, 0.50, 0.50,
  0.00, 0.00, 0.00
];
function randomizeColors(){
  var num = pallette.length /3;
  for(var i = 1; i < num-1; i++){
    var id = i * 3;
    var r = random(1);
    var g = random(1);
    var b = random(1);
    
    pallette[id + 0] = r;
    pallette[id + 1] = g;
    pallette[id + 2] = b;
  }
}
function keyPressed(){
    console.log("press",key);
  if(key === 'c'){
    randomizeColors();
  }
}

function draw(){
  if(!fbo) return;
  // ortho(0, width, -height, 0, 0, 20000);
  push();
  ortho();
  translate(-width/2, -height/2, 0);
  updateRD();
  pop();
  var w = tex.dst.w / SCREEN_SCALE;
  var h = tex.dst.h / SCREEN_SCALE;
  // display result
  shader_display.viewport(0, 0, w, h);
  shader_display.begin();
  shader_display.uniformF('PALLETTE', pallette, 7); 
  shader_display.uniformT('tex', tex.src);
  shader_display.uniformF('wh_rcp', [1.0/w, 1.0/h]);
  shader_display.quad();
  shader_display.end();
}

function initRD(){
  ortho();
  // translate(-width/2, -height/2, 0);    
  var gl = fbo.gl;  
  // bind framebuffer and texture for offscreenrendering
  fbo.begin(tex.dst);
  
  var w = tex.dst.w;
  var h = tex.dst.h;    
  
  gl.viewport(0, 0, w, h);
  gl.clearColor(1.0, 0.0, 0.0, 0.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.disable(gl.BLEND);
  gl.disable(gl.DEPTH_TEST);
  
  // < native p5 here
  noStroke();
  
  textSize(1000);
  fill(100,255,0);
  text('HEY', width/2, height/2);
  text('HEYO', 0, 0);
  
  ellipse(-100, 0, 100, 100);
  ellipse(+100, 0, 100, 100);
//   ellipse(0, -100, 100, 100);
//   ellipse(0, +100, 100, 100);
  // >
  tex.swap();
  fbo.end();
}
function updateRD(){
  var gl = fbo.gl;
  // multipass rendering (ping-pong)
  for(var i = 0; i < rdDef.iter; i++){    
    // set texture as rendertarget
    fbo.begin(tex.dst);    
    var w = tex.dst.w;
    var h = tex.dst.h;
 
    // clear texture
    gl.viewport(0, 0, w, h);
    gl.clearColor(1.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    //gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);    
    // apply shader
    shader_grayscott.begin();
    shader_grayscott.uniformF("dA"    , [rdDef.da]);
    shader_grayscott.uniformF("dB"    , [rdDef.db]);
    shader_grayscott.uniformF("feed"  , [rdDef.feed]);
		shader_grayscott.uniformF("iter" , [i]);
    shader_grayscott.uniformF("kill"  , [rdDef.kill]);
    shader_grayscott.uniformF("dt"    , [rdDef.dt]);
    shader_grayscott.uniformF("wh_rcp", [1.0/w, 1.0/h]);
    shader_grayscott.uniformT("tex"   , tex.src);
    shader_grayscott.quad();
    shader_grayscott.end();  
    
    
    if(mouseIsPressed){
      noStroke();
      fill(0,255,0);
    //   textSize(32);
    //   textFont(font);
    //   fill(0,255,0);
    //   text('HEY', mouseX, mouseY);
    //   torus(50,15);
    //   rect(mouseX-25, mouseY-25, 50, 50);
    //   text('HEYO', 0, 0);
      ellipse(mouseX, mouseY, 50, 50);
    } 
    
    
    // ping-pong
    tex.swap();
  }  
  // end fbo, so p5 can take over again.
  fbo.end();
}

(function () { 
  var loadJS = function(filename){
    var script = document.createElement("script");
    script.setAttribute("type","text/javascript");
    script.setAttribute("src", filename);
    document.getElementsByTagName("head")[0].appendChild(script);
  }

  loadJS("https://rawgit.com/diwi/p5.EasyCam/master/dwgl.js");
	loadJS("https://cdnjs.cloudflare.com/ajax/libs/dat-gui/0.6.5/dat.gui.min.js");
	console.log("done");
  document.oncontextmenu = function() { return false; }
  document.onmousedown   = function() { return false; }
 
})();
