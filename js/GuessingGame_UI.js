var myp5 = new p5( function( p ) {

    // track
    var angle = 0;
    var radius = 300;
    // var xPrev = 0.0;
    // var yPrev = 0.0;
    var x = 0;
    var y = 0;

    // timer vars
    var tic = 0;
    var timerAngle = 0;
    var timerRadius = 300 + 300 * (1/10);

    // constants
    const frame_rate = 30; // 30 frames/sec
    const time_scale = 60; // 60 sec timer.
    const tic_step = (360/time_scale/frame_rate); // in degrees

    // game object
    var game = new Game();
    var diff_init = game.difference();

    // config
    var font;
    var fontsize = 32;
    var bg_color;
    var tic_color;

    p.setup = function () {

        bg_color = p.color(235,235,235);
        tic_color = p.color(0);
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.background(bg_color);
        p.noFill();
        p.frameRate(frame_rate);
        p.textFont('Helvetica');
        p.textSize(fontsize);
        p.textAlign(p.CENTER, p.CENTER);

        x = p.sin(p.radians(0))*radius;
        y = p.cos(p.radians(0))*radius;

        //Listen to your custom event
        $(window).on('submit', function (e) {
            drawAnnotation();
        });

        // go!
        game.render();
    }

    p.windowResized = function() {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    }

    p.draw = function() { 
        if (game.state === STATE.PLAYING) {
            drawTrack();
            drawTimer();
        }
    }

    function drawTrack() {

        var radius, thickness, xPrev, yPrev;

        p.push();
        p.translate(p.width/2,p.height/2); // center

        radius = 300 - (250 - 250 * (game.difference()/diff_init));
        thickness = game.difference()/5;

        xPrev = x;
        yPrev = y;
        x = p.sin(p.radians(angle))*radius;
        y = p.cos(p.radians(angle))*radius;
        x2 = p.sin(p.radians(angle))*(radius+thickness);
        y2 = p.cos(p.radians(angle))*(radius+thickness);

        p.noFill();
        p.stroke(0);
        p.line(x, y, x2, y2);
        p.line(xPrev, yPrev, x, y);

        p.pop();

        angle+= tic_step; // += .5;
    }

    function drawTimer() {

        var tx1, ty1, tx2, ty2, tic_size;

        p.push();
        p.translate(p.width/2,p.height/2); // center

        tic_size = (tic % 30) ? 5 : 10;
        tx = p.sin(p.radians(timerAngle))*timerRadius;
        ty = p.cos(p.radians(timerAngle))*timerRadius;
        tx2 = p.sin(p.radians(timerAngle))*(timerRadius+tic_size);
        ty2 = p.cos(p.radians(timerAngle))*(timerRadius+tic_size);

        p.noFill();
        p.stroke((tic % 3) ? bg_color : tic_color); // only render every 3rd tic
        p.line(tx, ty, tx2, ty2);

        p.pop();

        timerAngle += tic_step;
        tic++;
    }

    function drawAnnotation() {

        var x, y;

        p.push();
        p.translate(p.width/2,p.height/2);// bring zero point to the center 

        x = p.sin(p.radians(angle))*radius;
        y = p.cos(p.radians(angle))*radius;

        p.fill(0);
        p.text(game.playersGuess.toString(), x, y);

        p.pop();
    }
});

