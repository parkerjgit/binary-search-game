var myp5 = new p5( function( p ) {

    // constants
    const frame_rate = 30; // 30 frames/sec
    const tics_per_sec = 10; // 10 tics/sec
    const duration = 60; // 60 sec timer.
    const track_step = (360/duration/frame_rate); // in degrees
    const clock_step = (360/duration/tics_per_sec); // in degrees

    var angle, radius, x, y; // track
    var tic, timerAngle, timerRadius; // timer vars
    var game, diff_init; // game object
    var font, fontsize, bg_color; // config
    // var tic_color;

    var layer2;

    p.setup = function () {

        fontsize = 32;
        bg_color = p.color(235,235,235);
        // tic_color = p.color(0);

        p.createCanvas(p.windowWidth, p.windowHeight);
        p.background(bg_color);
        p.noFill();
        p.frameRate(frame_rate);
        p.textFont('Helvetica');
        p.textSize(fontsize);
        p.textAlign(p.CENTER, p.CENTER);

        layer2 = p.createGraphics(p.windowWidth, p.windowHeight);

        //Listen for guesses
        $(window).on('submit', function (e) {
            setTimeout(function() {
                drawGuess();
                drawtimeStamp();
            }, 50); 
        });

        // listen for ready state
        $(window).on('ready', function (e) {
            setTimeout(function() {
                resetDrawing();
            }, 50); 
        });
        

        game = new Game();
        // resetDrawing();

        game.setup();
        game.render();
    }

    p.windowResized = function() {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    }

    p.draw = function() { 
        if (game.state === STATE.PLAYING) {
            drawTrack();
            isReset = false;
        } else if (game.state === STATE.WIN) {
            // drawWin();
        } else if (game.state === STATE.READY) {
            // resetDrawing();           
        } else {}

        p.image(layer2, 0, 0);
    }

    resetDrawing = function(isReset) {

        p.background(bg_color);

        // track
        angle = 0;
        radius = 300;
        x = p.sin(p.radians(0))*radius;
        y = p.cos(p.radians(0))*radius;
        diff_init = game.difference();

        // timer vars
        tic = 0;
        timerAngle = 0;
        timerRadius = 300 + 300 * (1/10);

        game.timer.onTick((minutes, seconds) => {
            drawTimer();
        });
    }

    function drawTrack() {

        var thickness, xPrev, yPrev;

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

        angle += track_step; // += .5;
    }

    function drawTimer() {

        var tx1, ty1, tx2, ty2, tic_size;

        p.push();
        p.translate(p.width/2,p.height/2); // center

        tic_size = (tic % 10) ? 5 : 10;
        tx = p.sin(p.radians(timerAngle))*timerRadius;
        ty = p.cos(p.radians(timerAngle))*timerRadius;
        tx2 = p.sin(p.radians(timerAngle))*(timerRadius+tic_size);
        ty2 = p.cos(p.radians(timerAngle))*(timerRadius+tic_size);

        p.noFill();
        p.stroke(0);
        p.line(tx, ty, tx2, ty2);

        p.pop();

        timerAngle += clock_step;
        tic++;
    }

    function drawArm() { 

        var x, y;

        layer2.push();
        layer2.translate(layer2.width/2,layer2.height/2); // center

        x = layer2.sin(layer2.radians(timerAngle))*(timerRadius+50);
        y = layer2.cos(layer2.radians(timerAngle))*(timerRadius+50);

        layer2.clear(); // this is not working...
        //layer2.background(bg_color);
        layer2.noFill();
        layer2.stroke(200,200,200,10);
        layer2.line(0, 0, x, y);

        layer2.pop();
    }

    function drawGuess() {

        var x, y;

        p.push();
        p.translate(p.width/2,p.height/2);// bring zero point to the center 

        x = p.sin(p.radians(angle-5))*radius;
        y = p.cos(p.radians(angle-5))*radius;

        p.fill(0);
        p.textSize(14);
        p.text(game.playersGuess.toString(), x, y);

        p.pop();
    }

    function drawtimeStamp() {

        var x, y;

        p.push();
        
        x = p.sin(p.radians(timerAngle))*(timerRadius+50);
        y = p.cos(p.radians(timerAngle))*(timerRadius+50);
        p.translate(p.width/2 + x, p.height/2 + y);// bring zero point to the center 
        p.rotate(p.radians(90-timerAngle));

        if (game.state === STATE.WIN) {
            p.fill(255,0,0);
            p.textSize(18);
        } else {
            p.fill(0);
            p.textSize(12);
        }
        p.text(game.timeRemaining, 0, 0);

        p.pop();
    }

    function drawWin() {

        var x, y, x2, y2

        p.push();
        p.translate(p.width/2,p.height/2);// bring zero point to the center 

        x = 0
        y = 0
        x2 = p.sin(p.radians(timerAngle))*(timerRadius+60);
        y2 = p.cos(p.radians(timerAngle))*(timerRadius+60);

        p.noFill();
        p.stroke(0); 
        p.line(x, y, x2, y2);

        p.fill(255,0,0);
        p.noStroke();
        p.textSize(24);
        //p.text(game.timeRemaining, x2, y2);

        p.pop();

    }
});

