// var sketch = function(p) {

var radius = 300;
var xPrev = 0.0;
var yPrev = 0.0;
var x = 0.0;
var y = 0.0;
var z = 0.0;
//var step = 0.01; // Size of each step along the path
var angle = 0;
var timerAngle = 0;
var tic_stroke = 0;
var tic = 0;

var frame_rate = 30;
var time_scale = 60; // 60 sec timer.
var tic_step = (360/time_scale/frame_rate);



var game = new Game();
var chances = 10;
var step = (radius * (4/5)) / chances
var chances_remaining = chances;

var font,
  fontsize = 32

function preload() {
  // Ensure the .ttf or .otf font stored in the assets directory
  // is loaded before setup() and draw() are called
  //font = loadFont('assets/SourceSansPro-Regular.otf');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(235, 235, 235);
    noStroke();
    frameRate(frame_rate);

    // Set text characteristics
    textFont('Helvetica');
    textSize(fontsize);
    textAlign(CENTER, CENTER);

    x = sin(radians(0))*radius;
    y = cos(radians(0))*radius;

    diff_init = game.difference();


    // init game state
    renderState();

    // play
    $('#play').click(function(e) {    
      game.state = STATE.PLAYING;
      renderState();
    })
    
    $('#submit').click(function(e) {
       makeAGuess(game);
       chances_remaining--;
       renderState();
    })
    $('#reset').click(function(e) {
        newGame(game);
        renderState();
    })

    $('#player-input').keypress(function(event) {
        if ( event.which == 13 ) {
           makeAGuess(game);
           stampGuess();
           chances_remaining--;
        }
        renderState();
    })
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() { 
  //background(220);
  drawViz();
  drawTimer();
}

function drawViz() {

  radius = 300 - (250 - 250 * (game.difference()/diff_init));

  diff = game.difference()/5;

  push();
  translate(width/2,height/2);// bring zero point to the center 
  
  // [xPrev, yPrev] = [x, y];
  xPrev = x;
  yPrev = y;
  x = sin(radians(angle))*radius;
  y = cos(radians(angle))*radius;

  x1 = x;
  y1 = y;
  x2 = sin(radians(angle))*(radius+diff);
  y2 = cos(radians(angle))*(radius+diff);
  
  //ellipse(x, y, diff);
  noFill();
  stroke(0);

  line(x1, y1, x2, y2);
  line(xPrev, yPrev, x, y);

  pop();
  angle += .5;
}

function drawTimer() {
  radius = 300 + 300 * (1/chances);
  tic_size = (tic % 30) ? 5 : 10;
  tic_stroke = (tic % 3) ? 255 : 0;

  push();
  translate(width/2,height/2);// bring zero point to the center 

  noFill();
  stroke(tic_stroke);
  x1 = sin(radians(timerAngle))*radius;
  y1 = cos(radians(timerAngle))*radius;
  x2 = sin(radians(timerAngle))*(radius+tic_size);
  y2 = cos(radians(timerAngle))*(radius+tic_size);
  line(x1, y1, x2, y2);

  pop();

  timerAngle += tic_step;
  tic++;
}

function stampGuess() {
  radius = 300 - (250 - 250 * (game.difference()/diff_init));
  push();
  translate(width/2,height/2);// bring zero point to the center 
  fill(0);
  x = sin(radians(angle))*radius;
  y = cos(radians(angle))*radius;
  text(game.playersGuess.toString(), x, y);
  pop();
}

function renderState() {
  switch (game.state) {
    case STATE.IDLE:
      $('#play').show();
      $('#player-input').hide();
      $('#reset').hide();
      break;
    case STATE.PLAYING:
      $('#play').hide();
      $('#player-input').show().focus();
      $('#reset').hide();
      break;
    case STATE.WIN:
      $('#play').hide();
      $('#player-input').show();
      $('#reset').hide();
      break;
    case STATE.LOSE:
      $('#play').hide();
      $('#player-input').show();
      $('#reset').hide();
      break;
    default:
      break;
  }
}