// Constant variables
const results = document.getElementById('results');

var count = 1;
let victory = false;
var darkMode = true;

// Colour variables
var gold = "#BB8E42";
var lMode_bg = "#F4F4F3";
var lMode_col = "#214249";
var dMode_bg = "#052329";
var dMode_col = "#F4F4F3";

/**
 * Submits AJAX form request with jquery
 * Return function is used to do client-side game logic and DOM manipulation
 */
$(document).ready(function() {
    $('#input-form').on('submit', function(event) {
        $.ajax({
            data : {
                champion : $('#input').val() 
            },
            type : 'POST',
            url : '/process'
        })
        .done(function(data) {
            if(count === 1){createFeedbackHeaders();}
            createFeedbackCards(data)
            if(data.champion === "correct") {
                victory = true;
                document.getElementById('submit').disabled = true;
                document.getElementById('submit').style.backgroundColor = "rgba(64,64,64, 0.8)";
                document.getElementById('submit').style.cursor = "not-allowed";

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

                $('#victory-image').fadeIn(1000)
                setTimeout(function(){
                    $('#victory-image').fadeOut(1000)
                    gameVictory(count-1);
                }, 2500);
                
            }
            else if(data.champion === "incorrect" && count === 8) {
                document.getElementById('submit').disabled = true;
                document.getElementById('submit').style.backgroundColor = "rgba(64,64,64, 0.8)";
                document.getElementById('submit').style.cursor = "not-allowed";

                if(localStorage.gamesPlayed) {
                    localStorage.gamesPlayed = Number(localStorage.gamesPlayed) + 1;
                } else {
                    localStorage.gamesPlayed = 1;
                }

                if(localStorage.gamesWon) {
                    // 
                } else {
                    localStorage.gamesWon = 0;
                }

                if(localStorage.totalGuesses) {
                    localStorage.totalGuesses = Number(localStorage.totalGuesses) + count - 1;
                } else {
                    localStorage.totalGuesses = count;
                }

                $('#defeat-image').fadeIn(1000)
                setTimeout(function(){
                    $('#defeat-image').fadeOut(1000)
                    gameDefeat();
                }, 2500);
            }
            else {incrementGuess();}
        })
        // Prevent form submitting data twice
        event.preventDefault();
        $("#input-form")[0].reset();
    })
})

/**
 * Create feedback cards with information from server-side game logic return values
 * @param {*} data The JSON object returned by the server
 */
function createFeedbackCards(data) {
    var $container = $("<div>", {"class": "grid-container"});

    var name = $("<h4></h4>").text(data.name).hide().fadeIn("slow");
    name.css("font-size", "18px");
    name.css("text-transform", "uppercase")
    
    var rolediv = $("<div></div>")
    var yeardiv = $("<div></div>")
    var skindiv = $("<div></div>")

    // Assigning role, year and skin values to a var
    var rolevalue = $("<span></span>").text(data.rolevalue);
    var yearvalue = $("<span></span>").text(data.yearvalue);
    var skinvalue = $("<span></span>").text(data.skinvalue);
    
    rolediv.append(iconFeedback(data.role), rolevalue);
    yeardiv.append(iconFeedback(data.year), yearvalue);
    skindiv.append(iconFeedback(data.skins), skinvalue);

    rolediv, yeardiv, skindiv = styleCard(rolediv, yeardiv, skindiv, data);

    $("#feedback-table").prepend($container);
    $("#feedback-table").prepend(name);
    $container.append(rolediv, yeardiv, skindiv).fadeIn("slow");
}

/**
 * Styling of feedback cards for correct guesses
 * @param {*} rolediv 
 * @param {*} yeardiv 
 * @param {*} skindiv 
 * @param {*} data 
 * @returns 
 */
function styleCard(rolediv, yeardiv, skindiv, data){
    if(darkMode == false) {
        rolediv.add(yeardiv).add(skindiv).css({"background-color": lMode_bg, "color": lMode_col});
    }

    else if(darkMode == true) {
        rolediv.add(yeardiv).add(skindiv).css({"background-color": dMode_bg, "color": dMode_col});
    }

    if(data.role == "correct") {rolediv.css("background-color", gold);}
    if(data.year == "correct") {yeardiv.css("background-color", gold);}
    if(data.skins == "correct") {skindiv.css("background-color", gold);}

    return rolediv, yeardiv, skindiv
}

/**
 * Create initial header to append feedback cards
 */
function createFeedbackHeaders() {
    var $headercontainer = $("<div>", {"class": "grid-container"});
    var roleheader = $("<p></p>").text("Role");
    var yearheader = $("<p></p>").text("Year");
    var skinheader = $("<p></p>").text("Skins");
    $headercontainer.append(roleheader, yearheader, skinheader);
    $headercontainer.css("border-bottom", "2px solid #BB8E42");
    $("#feedback-header").append($headercontainer).hide().fadeIn("slow");
}

/**
 * Dynamic icon based on user guess 
 * @param {*} feedback 
 * @returns icon for feedback card
 */
function iconFeedback(feedback) {
    var $icon
    if(feedback === "higher") {
        $icon = $("<i>", {"class": "fa fa-arrow-up"});
    }
    else if(feedback === "lower") {
        $icon = $("<i>", {"class": "fa fa-arrow-down"});
    }
    else if(feedback === "correct") {
        $icon = $("<i>", {"class": "fa fa-check"});
    }
    else if(feedback === "incorrect") {
        $icon = $("<i>", {"class": "fa fa-close"});
    }
    return $icon
}

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
 * Variables for CSS changes when site is in light mode
 */
function lightMode() {
    let element = document.body;
    let lightSwitch = document.getElementById("light-switch");

    let inputBox = document.getElementsByClassName("inputbox")[0];
    let userInput = document.getElementById("input");
    let submitButton = document.getElementById("submit");

    element.classList.toggle("light-mode");

    if(lightSwitch.checked) {
        darkMode = false;
        // Input Box Styling
        inputBox.style.backgroundColor=lMode_bg;
        inputBox.style.color ="#033039";

        // User Input Box Styling
        userInput.style.backgroundColor=lMode_bg;
        userInput.style.color=lMode_col;
        userInput.style.borderColor=lMode_col;

        // Submit Button Styling
        submitButton.style.color=lMode_bg;
        submitButton.style.borderColor=lMode_col;
        submitButton.style.backgroundColor=lMode_col;

        // Settings
        let modalContent = document.querySelectorAll(".modal-content");
        let modal = document.querySelectorAll(".modal");
        for (let i = 0; i < modalContent.length; i++){
            modalContent[i].style.backgroundColor=lMode_bg;
            modal[i].style.color=lMode_col;
        }

        // Feedback Cards
        let feedbackCards = document.querySelectorAll(".grid-container > div");
        for (let i = 0; i < feedbackCards.length; i++){
            feedbackCards[i].style.backgroundColor=lMode_bg;
            feedbackCards[i].style.color=lMode_col;
        }

        // Victory and Defeat
        let victory_header = document.getElementById("victory-header");
        let defeat_header = document.getElementById("defeat-header");
        victory_header.style.color=lMode_col;
        defeat_header.style.color=lMode_col;

    }

    else {
        darkMode = true;
        // Input Box Styling
        inputBox.style.backgroundColor=dMode_bg;
        inputBox.style.color=dMode_col;

        // User Input Box Styling
        userInput.style.backgroundColor=dMode_bg;
        userInput.style.color=dMode_col;
        userInput.style.borderColor=dMode_col;
        
        // Submit Button Styling
        submitButton.style.color=dMode_bg;
        submitButton.style.borderColor=dMode_col;
        submitButton.style.backgroundColor=dMode_col;

        // Settings
        let modalContent = document.querySelectorAll(".modal-content");
        let modal = document.querySelectorAll(".modal");
        for (let i = 0; i < modalContent.length; i++){
            modalContent[i].style.backgroundColor="#021119";
            modal[i].style.color=dMode_col;
        }

        // Feedback Cards
        let feedbackCards = document.querySelectorAll(".grid-container > div");
        for (let i = 0; i < feedbackCards.length; i++){
            feedbackCards[i].style.backgroundColor=dMode_bg;
            feedbackCards[i].style.color=dMode_col;
        }

        // Victory and Defeat
        let victory_header = document.getElementById("victory-header");
        let defeat_header = document.getElementById("defeat-header");
        victory_header.style.color=dMode_col;
        defeat_header.style.color=dMode_col;
    }
}

/**
 * Increment guess after each user guess
 * Updates placeholder text in game text input
 */
function incrementGuess() {
    count += 1;
    document.getElementById("input").placeholder = "GUESS " + count + " OUT OF 8";
}

/**
 * Victory modal functionality
 * @param {*} guesses number of guesses player made
 */
function gameVictory(guesses) {
    var guessesMadeDiv = $("<div></div>");
    let totalguesses = guesses + 1;
    var guessesMade = fontColor($("<span></span>").text('You won in ' + totalguesses + ' guesses.'));
    guessesMadeDiv.append(guessesMade);
    $("#victoryScreen").append(guessesMadeDiv);

    var gamesWonDiv = $("<div></div>");
    var gamesWon = fontColor($("<span></span>").text('Total games won: ' + localStorage.gamesWon));
    gamesWonDiv.append(gamesWon);
    $("#victoryScreen").append(gamesWonDiv);

    var gamesPlayedDiv = $("<div></div>");
    var gamesPlayed = fontColor($("<span></span>").text('Total games played: ' + localStorage.gamesPlayed));
    gamesPlayedDiv.append(gamesPlayed);
    $("#victoryScreen").append(gamesPlayedDiv);

    var gamesWRDiv = $("<div></div>");
    var gamesWR = fontColor($("<span></span>").text('Win rate: ' + (localStorage.gamesWon/localStorage.gamesPlayed).toFixed(2)));
    gamesWRDiv.append(gamesWR);
    $("#victoryScreen").append(gamesWRDiv);

    var averageGuessesDiv = $("<div></div>");
    var averageGuesses = fontColor($("<span></span>").text('Average guesses: ' + (localStorage.totalGuesses/localStorage.gamesPlayed).toFixed(2)));
    averageGuessesDiv.append(averageGuesses);
    $("#victoryScreen").append(averageGuessesDiv);

    openModal('victory-modal', 'victory-close');
}

/**
 * Defeat modal functionality
 */
function gameDefeat() {
    var guessesMadeDiv = $("<div></div>");
    var guessesMade = fontColor($("<span></span>").text('You failed to guess the champion.'));
    guessesMadeDiv.append(guessesMade);
    $("#defeatScreen").append(guessesMadeDiv);

    var gamesWonDiv = $("<div></div>");
    var gamesWon = fontColor($("<span></span>").text('Total games won: ' + localStorage.gamesWon));
    gamesWonDiv.append(gamesWon);
    $("#defeatScreen").append(gamesWonDiv);

    var gamesPlayedDiv = $("<div></div>");
    var gamesPlayed = fontColor($("<span></span>").text('Total games played: ' + localStorage.gamesPlayed));
    gamesPlayedDiv.append(gamesPlayed);
    $("#defeatScreen").append(gamesPlayedDiv);

    var gamesWRDiv = $("<div></div>");
    var gamesWR = fontColor($("<span></span>").text('Win rate: ' + (localStorage.gamesWon/localStorage.gamesPlayed).toFixed(2)));
    gamesWRDiv.append(gamesWR);
    $("#defeatScreen").append(gamesWRDiv);

    var averageGuessesDiv = $("<div></div>");
    var averageGuesses = fontColor($("<span></span>").text('Average guesses: ' + (localStorage.totalGuesses/localStorage.gamesPlayed).toFixed(2)));
    averageGuessesDiv.append(averageGuesses);
    $("#defeatScreen").append(averageGuessesDiv);

    openModal('defeat-modal', 'defeat-close');
}

/**
 * Change font colour when switching between light and dark mode
 * @param {*} object 
 * @returns 
 */
function fontColor(object) {
    if (darkMode == false) {
        object.css("color", lMode_col);
    }
    return object
}

/**
 * Clear the local storage on user machine
 */
function clearStorage() {
    // Clear localStorage items 
    if (confirm("WARNING: confirm statistics reset")) {
        localStorage.clear();
      } else {
        //
      }
  }

  /**
   * Dynamically update and display local storage statistics 
   * Called when statistics modal is opened
   */
  function populate_analytics() {
    let winpercentage = (localStorage.gamesWon / localStorage.gamesPlayed).toFixed(2);
    let averageguesses = (localStorage.totalGuesses/localStorage.gamesPlayed).toFixed(2);
    $('#gamesplayed').text('Games Played: ' + localStorage.gamesPlayed);
    $('#gameswon').text('Games Won: ' + (localStorage.gamesWon));
    $('#winpercentage').text('Win Percentage: ' + winpercentage);
    $('#averageguesses').text('Average Guesses: ' + averageguesses);
  }

  /**
   * Share button functionality
   * Uses local storage to create a formatted string
   * Adds formatted string to user clipboard
   */
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
