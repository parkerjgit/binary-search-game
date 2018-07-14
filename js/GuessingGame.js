const STATE = Object.freeze({
    IDLE: 1,
    READY: 2,
    PLAYING: 3,
    WIN: 4,
    LOSE: 5
})

var Game = function() {
    this.playersGuess = null;
    this.winningNumber = generateWinningNumber();
    this.lo = 0;
    this.hi = 100;
    this.pastGuesses = [];
    this.status = 'Can you guess a number in 60 seconds?';
    this.state = STATE.IDLE;
    this.timer = null;

    // this.render();
}

/****************************
RENDERING / DOM
****************************/

// tbd: should prop use stateful handlers instead.
Game.prototype.render = function() {
    // event binding
    $('#play').click((e) => {    
      this.state = STATE.READY;
      this.status = 'timer starts when you hit enter';
      this.update();
    })    
    $('#submit').click((e) => {
       this.makeAGuess(parseInt($('#player-input').val(), 10));
       $('#player-input').val("");
       this.update();
    })
    $('#reset').click((e) => {
        this.newGame(game);
        this.update();
    })
    $('#player-input').keypress((e) => {
        if ( e.which == 13 ) {
            
            if (this.state === STATE.READY) {
                this.state = STATE.PLAYING;
                //start the clock
                //this.timer_start = new Date().getTime();
                this.timer = setInterval(() => {
                    this.state = (this.state === STATE.PLAYING) ? STATE.LOSE : this.state;
                    this.makeAGuess(2);
                }, 5000);
            }
            this.makeAGuess(parseInt($('#player-input').val(), 10));
            $('#player-input').val("");
            var evt = $.Event('submit');
            $(window).trigger(evt);
        }
        this.update();
    })
    this.update();
}

Game.prototype.update = function() {
    switch (this.state) {
        case STATE.IDLE:
            $('#play').show();
            $('#player-input').hide();
            $('#reset').hide();
            break;
        case STATE.READY:
        case STATE.PLAYING:
            $('#play').hide();
            $('#player-input').show().focus();
            $('#reset').hide();
            $('#lo').text(this.lo);
            $('#hi').text(this.hi);
            break;
        case STATE.WIN:
            $('#play').hide();
            $('#player-input').show();
            $('#player-input').prop({ disabled: false });
            $('#reset').hide();
            break;
        case STATE.LOSE:
            $('#play').hide();
            $('#player-input').show();
            $('#player-input').prop({ disabled: false });
            $('#reset').hide();
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

Game.prototype.newGame = function() {
    Game.call(this.game); 
}

// Game.prototype.makeAGuess = function(guess) {
//     this.game.playersGuessSubmission(guess);
// }

Game.prototype.makeAGuess = function(num) {

    const invalidIf = [
        (typeof num !== 'number'),
        (Number.isNaN(num)),
        (num < 1), 
        (num > 100)
    ];

    // validate input
    if (invalidIf.some(x => x)) {
        throw "That is an invalid guess.";      
    } else {
        // submit
        this.playersGuess = num;
        this.status = this.checkGuess();
    }
}

Game.prototype.checkGuess = function() {

    var g = this.playersGuess;

    const guess = {
        win:  () => this.playersGuess === this.winningNumber,
        //lose: () => this.pastGuesses.length === 5,
        lose: () => this.state === STATE.LOSE,
        dupl: () => this.pastGuesses.includes(this.playersGuess)
    }

    const response = {
        lose: "You Lose.",
        win:  "You Win!",
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
        // update lo/hi
        this.lo = this.isLower() ? Math.max(g, this.lo) : this.lo;
        this.hi = this.isLower() ? this.hi : Math.min(g, this.hi);
    }

    // win or lose?
    if (guess.win()) {
        this.state = STATE.WIN;
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



/****************************
UTILS
****************************/

// utils
function generateWinningNumber() {
    return Math.ceil(Math.random()*100);
}


// this is the old UI!





// function resetGame(game) {
//     game = newGame();
//     console.log(game)
//     $('#subtitle').text('Guess a number between 1-100!');
//     $('#guess-list').empty();
//     for (let i=0; i<5; i++) {
//         $('#guess-list').append("<li class='guess'>-</li>");
//     }
//     $('#submit').prop({ disabled: false });
//     $('#hint').prop({ disabled: false });

// }



