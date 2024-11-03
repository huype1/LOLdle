
/**
 * Contains JavaScript functions relating to feedback card functionality and general CSS
 */

/**
 * Create feedback cards with information from server-side game logic return values
 * @param {*} data The JSON object returned by the server
 */
function createFeedbackCards(data) {
    var $container = $("<div>", {"class": "grid-container"});

    // Display champion image beside the name
    var image = $("<img>", { "src": `static/${data.image}`, "alt": `${data.name}'s image`, "class": "champion-image" }).css({
        "width": "100px",
        "height": "100px",
        "margin-right": "10px"
    });
    var name = $("<h4></h4>").text(data.name).css({
        "font-size": "18px",
        "text-transform": "uppercase",
        "display": "flex",
        "align-items": "center"
    }).prepend(image).hide().fadeIn("slow");

    // Fields to display with corresponding values from data
    const fields = [
        { label: "Gender", value: data.gender_value, feedback: data.Gender },
        { label: "Position", value: data.position_value, feedback: data.Positions },
        { label: "Range Type", value: data.range_type_value, feedback: data.RangeType },
        { label: "Region", value: data.regions_value, feedback: data.Regions },
        { label: "Year", value: data.year_value, feedback: data.year }
    ];

    // Loop to create divs for each field and append them to the container
    fields.forEach(field => {
        var fieldDiv = $("<div></div>").append(iconFeedback(field.feedback), $("<span></span>").text(field.value));
        if (field.feedback === "correct") {
            fieldDiv.css("background-color", "green");
        } else {
        fieldDiv.css({"background-color": "red", "color": "white"}); // light mode styling
        }
        $container.append(fieldDiv);
    });

    // Append the container to feedback table
    $("#feedback-table").prepend($container).css({"justify-content": "center"});
    $("#feedback-table").prepend(name);
    $container.fadeIn("slow").css({"border-bottom":"3px solid #BB8E42", "padding-bottom": "2px"});
}

/**
 * Create initial header to append feedback cards
 */
function createFeedbackHeaders() {
    var $headercontainer = $("<div>", {"class": "grid-container"});
    const headers = ["Gender", "Position", "Range Type", "Region", "Year"];

    headers.forEach(header => {
        var headerElement = $("<p></p>").text(header);
        $headercontainer.append(headerElement);
    });

    $headercontainer.css("border-bottom", "2px solid #BB8E42");
    $("#feedback-header").append($headercontainer).hide().fadeIn("slow");
}

/**
 * Generate feedback icons based on feedback result
 * @param {*} feedback Result string (e.g., "correct", "incorrect")
 * @returns jQuery element with icon styling
 */
function iconFeedback(feedback) {
    var icon = $("<span></span>").addClass("feedback-icon").css({"background-color": dMode_bg, "color": dMode_col});
    return icon;
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