
var Game = function() {

    this.playersGuess = null;
    this.winningNumber = generateWinningNumber();
    this.pastGuesses = [];
    this.status = null;
    this.state = 'idle';
}

Game.prototype.difference = function() {
    return Math.abs(this.playersGuess-this.winningNumber);
}

Game.prototype.isLower = function() {
    return this.playersGuess < this.winningNumber;
}

Game.prototype.playersGuessSubmission = function(num) {

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
        this.playersGuess = num;
        this.status = this.checkGuess();
    }

    // submit guess
    return this.status
}

Game.prototype.setState = function() {

}

Game.prototype.checkGuess = function() {

    const guess = {
        win:  () => this.playersGuess === this.winningNumber,
        lose: () => this.pastGuesses.length === 5,
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

    // duplicate?
    if (guess.dupl()) {
        return response.dupl;  
    } else {
        // record guess
        this.pastGuesses.push(this.playersGuess);
    }

    // win or lose?
    if (guess.win()) {
        this.state = 'win';
        return response.win;
    }
    if (guess.lose()) {
        this.state = 'lose';
        return response.lose;
    }

    // how far off?
    let d = this.difference();
    if (d < 10) return response.hot;
    if (d < 25) return response.warm;
    if (d < 50) return response.cool;

    // must be ice cold.
    return response.cold;
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

// utils
function generateWinningNumber() {
    return Math.ceil(Math.random()*100);
}


// this is the old UI!

function newGame(game) {
    Game.call(game); 
    $('#subtitle').text('Guess a number between 1-100!');
    $('#guess-list').empty();
    for (let i=0; i<5; i++) {
        $('#guess-list').append("<li class='guess'>-</li>");
    }
    $('#submit').prop({ disabled: false });
    $('#hint').prop({ disabled: false });
}

function makeAGuess(game) {
    var guess = $('#player-input').val();
    $('#player-input').val("");
    var output = game.playersGuessSubmission(parseInt(guess,10));
    // console.log(output);

    // if (output !== 'You have already guessed that number.') {
    //     $('#guess-list').find('li:last').remove();
    //     $('#guess-list').prepend("<li class='guess'>"+game.playersGuess+"</li>");
    // }

    $('#subtitle').text(output);

    if (output === 'You Win!' || output === 'You Lose.') {
        $('#submit').prop({ disabled: true });
        $('#hint').prop({ disabled: true });
    } 
}

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



