const STATE = Object.freeze({
    IDLE: 1,
    READY: 2,
    PLAYING: 3,
    WIN: 4,
    LOSE: 5
})

const MAXGUESSES = 1000;

var Game = function({
    playersGuess = null,
    pastGuesses = [], 
    state = STATE.IDLE,
    timer = null,
    level = 1,
} = {}) {

    this.playersGuess = playersGuess; 
    this.pastGuesses = pastGuesses;  
    this.state = state;
    this.timer = timer;
    this.level = level;

    this.lo = 0 + Math.floor(Math.random()*20);
    this.hi = Math.pow(2,(6+this.level)) - Math.floor(Math.random()*20);
    this.winningNumber = generateWinningNumber(this.lo, this.hi);
    this.status = 'Guess a number between ' + (this.lo).toString() + ' and ' + (this.hi).toString() + '. (you have 60 seconds!)';
}

/****************************
RENDERING / DOM
****************************/

// tbd: should prop use stateful handlers instead.
Game.prototype.setup = function() {

    const handleKeyPress = function(e, ctx) {
        if ( e.which == 13 ) {       
            if (ctx.state === STATE.READY) {
                ctx.startPlaying();
                ctx.parseInput();
                ctx.submitGuess();
            } else if (ctx.state === STATE.PLAYING) {
                ctx.parseInput();
                ctx.submitGuess(); 
            } else if (ctx.state === STATE.WIN) {
                ctx.levelUp();
            } else {
                // do nothing
            }
        }
    }

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
        handleKeyPress(e, this);
        this.render();
    });
};

Game.prototype.levelUp = function() {
    Game.call(this, {
        state: STATE.READY,
        level: ++this.level
    })
}

Game.prototype.render = function() {
    switch (this.state) {
        case STATE.IDLE:
            $('#play').show();
            $('#player-input').hide();
            $('#reset').hide();
            break;
        case STATE.READY:
            $('#winner').hide();
            $('#winner').text(this.winningNumber);
        case STATE.PLAYING:
            $('#play').hide();
            $('#player-input').show().focus();
            $('#reset').hide();
            $('#lo').text(this.lo);
            $('#hi').text(this.hi);
            $('#winner').hide();
            break;
        case STATE.WIN:
            $('#play').hide();
            $('#player-input').hide();
            $('#reset').hide();
            $('#winner').show();
            break;
        case STATE.LOSE:
            $('#play').hide();
            $('#player-input').hide();
            $('#reset').show();
            break;
        default:
            break;
    }
    $('#subtitle').text(this.status);
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
    this.status = 'Key in your first guess. The timer starts when you hit ENTER.';
    // this.render();
}

Game.prototype.startPlaying = function() {
    this.state = STATE.PLAYING;

    this.timer = setTimeout(() => {
        this.state = (this.state === STATE.PLAYING) ? STATE.LOSE : this.state;
        this.status = this.update();
        this.render();
    }, 60000);
}

Game.prototype.resetGame = function() {
    Game.call(this);
    // this.render();
}

Game.prototype.parseInput = function() {
    this.submitGuess(parseInt($('#player-input').val(), 10));
    $('#player-input').val("");
}

Game.prototype.submitGuess = function(num) {

    const invalid = [
        (typeof num !== 'number'),
        (Number.isNaN(num)),
        (num < 0), 
        (num > Number.MAX_SAFE_INTEGER)
    ].some(x => x);

    // submit if valid
    if (invalid) {
        throw "That is an invalid guess.";      
    } else {
        this.playersGuess = num;
        this.status = this.update();
        this.broadCast();
    }

    // for some reason, this is needed for lo/hi to update instantly!!??
    this.render();
}

Game.prototype.update = function() {

    var g = this.playersGuess;

    const guess = {
        win:  () => this.playersGuess === this.winningNumber,
        lose: () => (this.state === STATE.LOSE) || 
                    (this.pastGuesses.length > MAXGUESSES),
        dupl: () => this.pastGuesses.includes(this.playersGuess)
    }

    const response = {
        lose: "You Lose. The number was ------> " + this.winningNumber.toString(),
        win:  "You Win! Ready for level " + (this.level + 1).toString() + "? (hit enter)",
        dupl: "You have already guessed that number.",
        cold: "You\'re ice cold!",
        cool: "You\'re a bit chilly.",
        warm: "You\'re lukewarm.",
        hot:  "You\'re burning up!"
    }

    if (guess.lose()) {
        // this.state = STATE.LOSE;
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
        clearTimeout(this.timer);
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

/****************************
UTILS
****************************/

// utils
// function generateWinningNumber() {
//     return Math.ceil(Math.random()*100);
// }

function generateWinningNumber(min=0,max=100){
    return Math.floor(Math.random()*(max-min+1)+min);
}
