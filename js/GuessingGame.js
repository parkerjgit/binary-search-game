const STATE = Object.freeze({
    IDLE: 1,
    READY: 2,
    PLAYING: 3,
    WIN: 4,
    LOSE: 5
})

const MAXGUESSES = 1000;

var statusTimer;

/****************************
Game Engine
****************************/

var Game = function({
    playersGuess = null,
    pastGuesses = [], 
    state = STATE.IDLE,
    level = 1,
    timer = new Timer(60, 100),
    timeRemaining = '00:60'
} = {}) {

    this.playersGuess = playersGuess; 
    this.pastGuesses = pastGuesses;  
    this.state = state;
    this.level = level;
    this.timeRemaining = timeRemaining;

    this.lo = 0 + Math.floor(Math.random()*20);
    this.hi = Math.pow(2,(6+this.level)) - Math.floor(Math.random()*20);
    this.winningNumber = generateWinningNumber(this.lo, this.hi);

    this.timer = timer;
    this.timer.onTick((minutes, seconds) => {
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        this.timeRemaining = minutes + ':' + seconds;
    });
    this.timer.onExpired(() => {
        // this.state = STATE.LOSE;
        // this.status = this.checkGuess();
        this.loseGame();
    });

    this.status = '';
}

/****************************
RENDERING / DOM
****************************/

// tbd: should prop use stateful handlers instead.
Game.prototype.setup = function() {

    // event binding
    $('#play').click((e) => { 
        this.getReady();
        this.render();      
    })    
    $('#reset').click((e) => {
        this.resetGame();
        this.render();    
    })
    $(document).keypress((e) => {
        if ( e.which == 13 ) {  
            this.update();
            this.render();
        } else {
            if (this.state === STATE.READY ||
                this.state === STATE.PLAYING) {
                this.status = '';
            }
            this.render();
        }
    });
};

Game.prototype.update = function() {
    switch (this.state) {
        case STATE.IDLE:
            this.getReady();
            break;
        case STATE.READY:
            this.makeAGuess(); // first guess.
            break;
        case STATE.PLAYING:
            this.makeAGuess(); // subsequent guesses.
            break;
        case STATE.WIN:
            this.levelUp();
            break;
        case STATE.LOSE:
            this.resetGame();
            break;
        default:
            break;
    }
}

Game.prototype.render = function() {

    const flashStatus = function(duration) {

        $('#status').text(this.status);

        if (typeof statusTimer !== undefined) {
            clearTimeout(statusTimer);
        }
        statusTimer = setTimeout(() => 
            $('#status').fadeOut(() => 
                $('#status').text('').show())
            , duration);
    }

    switch (this.state) {
        case STATE.IDLE:
            $('#players-guess').hide();
            $('#level').hide();
            break;
        case STATE.READY:
            $('#intro').hide();
            $('#players-guess').show().focus();
            $('#lo').text(this.lo);
            $('#hi').text(this.hi);
            $('#winning-number').hide();
            $('#winning-number').text(this.winningNumber); 
            $('#level').text(this.level); 
            $('#level').show();
            $('#status').text(this.status);
            break;
        case STATE.PLAYING:
            $('#players-guess').show().focus();
            $('#lo').text(this.lo);
            $('#hi').text(this.hi);
            $('#winning-number').hide();
            $('#level').hide();
            flashStatus.call(this, 3000);
            break;
        case STATE.WIN:
            $('#players-guess').hide();
            $('#winning-number').show();
            $('#level').hide();
            $('#status').text(this.status);
            break;
        case STATE.LOSE:
            $('#players-guess').hide();
            $('#level').hide();
            $('#status').text(this.status);
            break;
        default:
            break;
    }
}

/****************************
ACCESSORS
****************************/

Game.prototype.difference = function() {
    return Math.abs(this.playersGuess-this.winningNumber);
}

Game.prototype.isLower = function() {
    return this.playersGuess < this.winningNumber;
}

Game.prototype.provideHint = function() {

    // add winning number
    var res = [this.winningNumber]; 
    
    // add random numbers
    var numRandom = 2;
    for (let i=0; i<numRandom; i++) {
        res.push(generateWinningNumber());
    }

    // return numbers shuffled
    return (function shuffle(arr) {

        var remaining = arr.length;

        while(remaining) {
            let i = Math.floor(Math.random() * remaining);
            let j = --remaining;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    })(res);
}

/****************************
MUTATORS
****************************/

Game.prototype.getReady = function() {
    this.state = STATE.READY;

    this.status = `Level ${this.level}: You have 60 seconds to guess a number between \
        ${(this.lo).toString()} and ${(this.hi).toString()}. When your ready, key in your \
        first guess. The clock starts when you press ENTER.`;

    this.broadCastReady();
}

Game.prototype.startPlaying = function() {
    this.state = STATE.PLAYING;
    this.timer.start();
}

Game.prototype.makeAGuess = function() {

    const parse = function() {
        var input = $('#players-guess').val();
        $('#players-guess').val("");

        return parseInt(input, 10); 
    };

    const validate = function(input) {
        const invalid = [
            (typeof input !== 'number'),
            (Number.isNaN(input)),
            (input < 0), 
            (input > Number.MAX_SAFE_INTEGER)
        ].some(x => x);

        if (invalid) {
            throw "That is an invalid guess.";      
        } else {
            return input
        }
    };

    const submit = function(input) {
        if (typeof input !== 'undefined') {
            if (this.state === STATE.READY) {
                this.startPlaying();
            }
            this.playersGuess = input;
            this.status = this.checkGuess();
            this.broadCast();
        }
    };

    submit.call(this, validate(parse()));
}

Game.prototype.levelUp = function() {
    Game.call(this, {
        state: STATE.IDLE,
        level: ++this.level
    })
    this.getReady();
}

Game.prototype.resetGame = function() {
    // Game.call(this);
    Game.call(this, {
        state: STATE.IDLE,
        level: 1
    })
    this.getReady();
}

Game.prototype.loseGame = function() {
    this.state = STATE.LOSE;
    this.status = `You Lose. The number was ${this.winningNumber.toString()}. (hit enter to play again)`;
    this.render();
}

Game.prototype.checkGuess = function() {

    var g = this.playersGuess;

    const guess = {
        win:  () => this.playersGuess === this.winningNumber,
        lose: () => (this.state === STATE.LOSE) || 
                    (this.pastGuesses.length > MAXGUESSES),
        dupl: () => this.pastGuesses.includes(this.playersGuess)
    }

    const response = {
        lose: `You Lose. The number was ${this.winningNumber.toString()}. (hit enter to play again)`,
        win:  `You Win! Ready for level ${(this.level + 1).toString()}? (hit enter)`,
        dupl: "You have already guessed that number.",
        cold: "You\'re ice cold!",
        cool: "You\'re a bit chilly.",
        warm: "You\'re lukewarm.",
        hot:  "You\'re burning up!" 
    }

    if (guess.lose()) {
        this.state = STATE.LOSE;
        return response.lose;
    }

    // duplicate?
    if (guess.dupl()) {
        return response.dupl;  
    } else {
        // record guess
        this.pastGuesses.push(this.playersGuess);
        // render lo/hi
        this.lo = this.isLower() ? Math.max(g, this.lo) : this.lo;
        this.hi = this.isLower() ? this.hi : Math.min(g, this.hi);
    }

    // win or lose?
    if (guess.win()) {
        this.state = STATE.WIN;
        this.timer.stop();
        return response.win;
    }
    
    // how far off?
    let d = this.difference();
    if (d < 10) return response.hot;
    if (d < 25) return response.warm;
    if (d < 50) return response.cool;

    // must be ice cold.
    return response.cold;
}

Game.prototype.broadCast = function() {
    var evt = $.Event('submit');
    $(window).trigger(evt);
}

Game.prototype.broadCastReady = function() {
    var evt = $.Event('ready');
    $(window).trigger(evt);
}

Game.prototype.broadCastTimesUp = function() {
    var evt = $.Event('timesUp');
    $(window).trigger(evt);
}

/****************************
UTILS
****************************/

function generateWinningNumber(min=0,max=100){
    return Math.floor(Math.random()*(max-min+1)+min);
}

/****************************
Timer adapted from:
https://stackoverflow.com/questions/20618355/the-simplest-possible-javascript-countdown-timer
****************************/

function Timer(duration, increment = 1000) {
  this.duration = duration;
  this.increment = increment;
  this.callbacks = [];
  this.timesUp = null
  this.running = false;
}

Timer.prototype.start = function() {

    var start = Date.now(),
        that = this,
        remain, 
        obj;

    this.running = true;
  
    (function timer() {

        remain = that.duration - Math.trunc( ((Date.now() - start) / 1000) );

        // time is not up (lose) or stopped (win) -> keep going
        if (remain > 0 && that.running) {

            that.callbacks.forEach(function(fn) {
                fn.call(this, ...[
                    Math.trunc(remain / 60),
                    Math.trunc(remain % 60)
                ])
            }, that);

            setTimeout(timer, that.increment);

        } else if (remain <= 0) { // time is up -> lose
            that.timesUp.call(this);

        } else { // time was stopped -> win 
            // do nothing for now...
        }
    }());
};

Timer.prototype.stop = function() {
    this.running = false;
}

Timer.prototype.onTick = function(fn) {
    if (typeof fn === 'function') {
        this.callbacks.push(fn);
    }
    return this;
};

Timer.prototype.onExpired = function(fn) {
    if (typeof fn === 'function') {
        this.timesUp = fn;
    }
    return this;
};

