var count = 1;
let victory = false;
let currentChampionId;


$.ajax({
    url: '/stats',
    method: 'POST',
    contentType: 'application/json',
    success: function(data) {
        if (data.error) {
            console.error(data.error);
        } else {
        console.log(data)
            localStorage.setItem('gamesWon', data.onlineGamesWon);
            localStorage.setItem('gamesPlayed', data.onlineGamesPlayed);
            localStorage.setItem('totalGuesses', data.onlineAvgGuesses);
        }
    },
    error: function(xhr, status, error) {
        console.error('Error fetching user score:', error);
    }
});
/**
 * Initialize game state when document loads
 * Selects random champion ID and stores it for the session
 */
function initializeGame() {
    // Only initialize if there's no active game
    if (!sessionStorage.getItem('currentChampionId')) {
        const totalChampions = 50
        currentChampionId = Math.floor(Math.random() * totalChampions) + 1;
        sessionStorage.setItem('currentChampionId', currentChampionId);
    } else {
        currentChampionId = parseInt(sessionStorage.getItem('currentChampionId'));
    }
}

/**
 * Reset game state for a new game
 */
function resetGame() {
    sessionStorage.removeItem('currentChampionId');
    count = 1;
    victory = false;
    initializeGame();
    document.getElementById('submit').disabled = false;
    document.getElementById('submit').style.backgroundColor = "";
    document.getElementById('submit').style.cursor = "";
    document.getElementById("input").placeholder = "GUESS 1 OUT OF 8";
}
function newGame() {
    resetGame();
    location.reload()
}


$(document).ready(function() {
    // Initialize game when page loads
    initializeGame();

    $('#input-form').on('submit', function(event) {
        guess = $('#input').val();
        guess = guess[0].toUpperCase() + guess.substring(1);

        $.ajax({
            data: {
                champion: guess,
            },
            type: 'POST',
            url: `/process?answer_index=${currentChampionId}`
        })
        .done(function(data) {
            if(count === 1){createFeedbackHeaders();}
            createFeedbackCards(data)

            if(data.champion === "correct") {


                if(localStorage.gamesWon) {
                    localStorage.gamesWon = Number(localStorage.gamesWon) + 1;
                } else {
                    localStorage.gamesWon = 1;
                }

                if(localStorage.gamesPlayed) {
                    localStorage.gamesPlayed = Number(localStorage.gamesPlayed) + 1;
                } else {
                    localStorage.gamesPlayed = 1;
                }

                if(localStorage.totalGuesses) {
                    localStorage.totalGuesses = Number(localStorage.totalGuesses) + count;
                } else {
                    localStorage.totalGuesses = count;
                }
                updateStatsInDatabase();

                $('#victory-image').fadeIn(1000)
                setTimeout(function(){
                    victory = true;
                    document.getElementById('submit').disabled = true;
                    document.getElementById('submit').style.backgroundColor = "rgba(64,64,64, 0.8)";
                    document.getElementById('submit').style.cursor = "not-allowed";
                    $('#victory-image').fadeOut(800)
                    gameVictory(count-1);
                }, 2500);

            }
            else if(data.champion === "incorrect" && count === 8) {
                let answer = data.answer;
                if(localStorage.gamesPlayed) {
                    localStorage.gamesPlayed = Number(localStorage.gamesPlayed) + 1;
                } else {
                    localStorage.gamesPlayed = 1;
                }

                if(localStorage.gamesWon) {
                    // Keep existing value
                } else {
                    localStorage.gamesWon = 0;
                }

                if(localStorage.totalGuesses) {
                    localStorage.totalGuesses = Number(localStorage.totalGuesses) + count - 1;
                } else {
                    localStorage.totalGuesses = count;
                }
                updateStatsInDatabase();

                $('#defeat-image').fadeIn(1000)
                setTimeout(function(){
                    victory = true;
                    document.getElementById('submit').disabled = true;
                    document.getElementById('submit').style.backgroundColor = "rgba(64,64,64, 0.8)";
                    document.getElementById('submit').style.cursor = "not-allowed";
                    $('#defeat-image').fadeOut(800)
                    gameDefeat(answer);

                }, 2500);
            }
            else {incrementGuess();}
        })
        // Prevent form submitting data twice
        event.preventDefault();
        $("#input-form")[0].reset();
    });
});

function updateStatsInDatabase() {
    // Prepare data to be sent in the request
    const updatedStats = {
        gamesWon: localStorage.getItem('gamesWon'),
        gamesPlayed: localStorage.getItem('gamesPlayed'),
        totalGuesses: localStorage.getItem('totalGuesses')
    };

    $.ajax({
        url: '/update_stats',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(updatedStats),
        success: function(response) {
            console.log(response.message);
        },
        error: function(xhr, status, error) {
            console.error('Error updating stats:', error);
        }
    });
}
function incrementGuess() {
    count += 1;
    document.getElementById("input").placeholder = "GUESS " + count + " OUT OF 8";
}

function clearStorage() {
    if (confirm("WARNING: confirm statistics reset")) {
        localStorage.clear();
        sessionStorage.clear();
        resetGame();
    }
}

function share() {
    let winpercentage = (localStorage.gamesWon / localStorage.gamesPlayed).toFixed(2);
    let averageguesses = (localStorage.totalGuesses/localStorage.gamesPlayed).toFixed(2);
    let gamesplayed = localStorage.gamesPlayed;
    let gameswon = localStorage.gamesWon;
    let guesses = count;

    let result = ``;
    if(victory) {
        result += `Victory!\n`;
    } else {
        result += `Defeat!\n`;
    }
    result += `Game ended with ${guesses} guesses\n`;
    result += `Average number of guesses: ${averageguesses}\n`;
    result += `Total games won: ${gameswon}\n`;
    result += `Total games played: ${gamesplayed}\n`;
    result += `Win percentage: ${winpercentage*100}%\n`;

    navigator.clipboard.writeText(result);
}

