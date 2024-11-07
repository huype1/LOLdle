/**
 * Scripts relating to modals
 * Functions dynamically populate modals based on statistics
 */

/**
 * Used for opening various modals on the main site page
 * @param {*} type 
 * @param {*} id 
 */
 function openModal(type,id) {
    // Get the modal
    var modal = document.getElementById(type);

    // Get element to close modal
    var span = document.getElementById(id);
    modal.style.display = "block";

    // Clicking on cross icon closes modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // Clicking outside of modal closes modal
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}
/**
 * Victory modal functionality
 * @param {*} guesses number of guesses player made
 */
function gameVictory(guesses) {
    var guessesMadeDiv = $("<div></div>");
    let totalguesses = guesses + 1;
    var guessesMade = $("<span></span>").text('You won in ' + totalguesses + ' guesses.').css("color", "white");
    guessesMadeDiv.append(guessesMade);
    $("#victoryScreen").append(guessesMadeDiv);

    var gamesWonDiv = $("<div></div>");
    var gamesWon = $("<span></span>").text('Total games won: ' + localStorage.gamesWon).css("color", "white");
    gamesWonDiv.append(gamesWon);
    $("#victoryScreen").append(gamesWonDiv);

    var gamesPlayedDiv = $("<div></div>");
    var gamesPlayed = $("<span></span>").text('Total games played: ' + localStorage.gamesPlayed).css("color", "white");
    gamesPlayedDiv.append(gamesPlayed);
    $("#victoryScreen").append(gamesPlayedDiv);

    var gamesWRDiv = $("<div></div>");
    var gamesWR = $("<span></span>").text('Win rate: ' + (localStorage.gamesWon / localStorage.gamesPlayed * 100).toFixed(2) + '%').css("color", "white");
    gamesWRDiv.append(gamesWR);
    $("#victoryScreen").append(gamesWRDiv);

    var averageGuessesDiv = $("<div></div>");
    var averageGuesses = $("<span></span>").text('Average guesses: ' + localStorage.averageGuess).css("color", "white");
    averageGuessesDiv.append(averageGuesses);
    $("#victoryScreen").append(averageGuessesDiv);

    openModal('victory-modal', 'victory-close');
}

/**
 * Defeat modal functionality
 */
function gameDefeat(answer) {
    var guessesMadeDiv = $("<div></div>");
    var guessesMade = $("<span></span>").text('You failed to guess the champion.').css("color", "white");
    guessesMadeDiv.append(guessesMade);
    $("#defeatScreen").append(guessesMadeDiv);

    var answerDiv = $("<div></div>");
    var answerText = $("<span></span>").text('The answer was: ' + answer).css("color", "white");
    answerDiv.append(answerText);
    $("#defeatScreen").append(answerDiv);

    var gamesWonDiv = $("<div></div>");
    var gamesWon = $("<span></span>").text('Total games won: ' + localStorage.gamesWon).css("color", "white");
    gamesWonDiv.append(gamesWon);
    $("#defeatScreen").append(gamesWonDiv);

    var gamesPlayedDiv = $("<div></div>");
    var gamesPlayed = $("<span></span>").text('Total games played: ' + localStorage.gamesPlayed).css("color", "white");
    gamesPlayedDiv.append(gamesPlayed);
    $("#defeatScreen").append(gamesPlayedDiv);

    var gamesWRDiv = $("<div></div>");
    var gamesWR = $("<span></span>").text('Win rate: ' + (localStorage.gamesWon / localStorage.gamesPlayed * 100).toFixed(2) + '%').css("color", "white");
    gamesWRDiv.append(gamesWR);
    $("#defeatScreen").append(gamesWRDiv);

    var averageGuessesDiv = $("<div></div>");
    var averageGuesses = $("<span></span>").text('Average guesses: ' + localStorage.averageGuess).css("color", "white");
    averageGuessesDiv.append(averageGuesses);
    $("#defeatScreen").append(averageGuessesDiv);

    openModal('defeat-modal', 'defeat-close');
}
