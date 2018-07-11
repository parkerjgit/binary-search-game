
var Game = function() {
    this.playersGuess = null;
    this.winningNumber = generateWinningNumber();
    this.pastGuesses = [];
}

function generateWinningNumber() {
    return Math.ceil(Math.random()*100);
}


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

Game.prototype.difference = function() {
    return Math.abs(this.playersGuess-this.winningNumber);
}

Game.prototype.isLower = function() {
    return this.playersGuess < this.winningNumber;
}

Game.prototype.playersGuessSubmission = function(num) {

    var invalidIf = [
        (typeof num !== 'number'),
        (Number.isNaN(num)),
        (num < 1), 
        (num > 100)
    ];

    if (invalidIf.some(x => x)) {
        throw "That is an invalid guess.";      
    } else {
        this.playersGuess = num;
    }

    return this.checkGuess(this.playersGuess);
}

Game.prototype.checkGuess = function(guess) {

    console.log(this);

    if (this.pastGuesses.length === 4) {
        return "You Lose.";

    } else if (guess === this.winningNumber) {
        return "You Win!";

    } else if (this.pastGuesses.includes(this.playersGuess)) {
        return "You have already guessed that number."

    } else {
        this.pastGuesses.push(guess);

        let d = this.difference();
        if (d < 10) return "You\'re burning up!";
        if (d < 25) return "You\'re lukewarm.";
        if (d < 50) return "You\'re a bit chilly.";

        return "You\'re ice cold!";
    }
}

Game.prototype.provideHint = function() {

    var res = [this.winningNumber]; 

    for (let i=0; i<2; i++) {
        res.push(generateWinningNumber());
    }
    return shuffle(res);
}

function shuffle(arr) {

    var remaining = arr.length;

    while(remaining) {
        let i = Math.floor(Math.random() * remaining);
        let j = --remaining;
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function makeAGuess(game) {
    var guess = $('#player-input').val();
    $('#player-input').val("");
    var output = game.playersGuessSubmission(parseInt(guess,10));
    // console.log(output);

    if (output !== 'You have already guessed that number.') {
        $('#guess-list').find('li:last').remove();
        $('#guess-list').prepend("<li class='guess'>"+game.playersGuess+"</li>");
    }

    $('#subtitle').text(output);

    if (output === 'You Win!' || output === 'You Lose.') {
        $('#submit').prop({ disabled: true });
        $('#hint').prop({ disabled: true });
    } 
}

function resetGame(game) {
    game = newGame();
    console.log(game)
    $('#subtitle').text('Guess a number between 1-100!');
    $('#guess-list').empty();
    for (let i=0; i<5; i++) {
        $('#guess-list').append("<li class='guess'>-</li>");
    }
    $('#submit').prop({ disabled: false });
    $('#hint').prop({ disabled: false });

}

// $(document).ready(function() {
$(function() {
    var game = new Game();

    $('#submit').click(function(e) {
       makeAGuess(game);
    })

    $('#reset').click(function(e) {
        newGame(game);
    })

    $('#player-input').keypress(function(event) {
        if ( event.which == 13 ) {
           makeAGuess(game);
        }
    })
})

