

var x = 0.0; // Current x-coordinate
var y = 0.0; // Current y-coordinate
var z = 0.0;
//var step = 0.01; // Size of each step along the path
var angle = 0;
var radius = 300;

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
    background(255, 0, 200);
    noStroke();

    // Set text characteristics
    textFont('Helvetica');
    textSize(fontsize);
    textAlign(CENTER, CENTER);

  // $(document).ready(function() {
// $(function() {

    // init game state
    renderState();

    // play
    $('#play').click(function(e) {
      
      game.state = 'playing';
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
// })

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() { 
	//background(220);

	radius = 300 * (chances_remaining/chances);

	diff = game.difference()/10;

	push();
	translate(width/2,height/2);// bring zero point to the center 
	fill(0);
	x = sin(radians(angle))*radius;
	y = cos(radians(angle))*radius;
	ellipse(x, y, diff);

	pop();
	angle += .5;
 

}

function stampGuess() {
  radius = 300 * (chances_remaining/chances);
  push();
  translate(width/2,height/2);// bring zero point to the center 
  fill(0);
  x = sin(radians(angle))*radius;
  y = cos(radians(angle))*radius;
  text(game.playersGuess.toString() + ' ' + game.status.toString(), x, y);
  pop();
}

function renderState() {
  switch (game.state) {
    case 'idle':
      $('#play').show();
      $('#player-input').hide();
      $('#reset').hide();
      break;
    case 'playing':
      $('#play').hide();
      $('#player-input').show().focus();
      $('#reset').hide();
      break;
    case 'win':
      $('#play').hide();
      $('#player-input').show();
      $('#reset').hide();
      break;
    case 'lose':
      $('#play').hide();
      $('#player-input').show();
      $('#reset').hide();
      break;
    default:
      break;
  }
}