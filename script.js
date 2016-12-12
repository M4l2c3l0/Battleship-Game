var view = {
    displayMessage: function(msg) {
        var messageArea = document.getElementById ("messageArea");  //finds messageArea from HTML doc and assigns it to "messageArea"
        messageArea.innerHTML = msg;                                //assigns to it the value of "msg"
    },
    displayHit: function(location) {
        var cell = document.getElementById(location);
        cell.setAttribute("class", "hit");
    },
    displayMiss: function(location) {
        var cell = document.getElementById(location);
        cell.setAttribute("class", "miss");
    }
};

var model = {
    boardSize: 7,
    numShips: 3,
    shipLength: 3,
    shipsSunk: 0,
    ships: [{ locations: [0, 0, 0], hits: ["", "", ""] },
            { locations: [0, 0, 0], hits: ["", "", ""] },
            { locations: [0, 0, 0], hits: ["", "", ""] }],
    generateShip: function() {
        var direction = Math.floor(Math.random()*2);        //gives num from 0 to almost 2, then rounded down to whole num (0 or 1)
        var row;
        var col;
        if(direction===1) {                                                             //for a horizontal positioning...
            row = Math.floor(Math.random() * this.boardSize);                           //starting position generated in any row
            col = Math.floor(Math.random() * (this.boardSize - (this.shipLength + 1))); //but column only 0 and 4
        } else {                                                                        //for a vertical positioning...
            row = Math.floor(Math.random() * (this.boardSize - (this.shipLength + 1))); //starting position must be within row 0 to 4
            col = Math.floor(Math.random() * this.boardSize);                           //but can be in any column
        }
        var newShipLocations = [];                          //empty array to which all locations will be added
        for(var i=0; i<this.shipLength; i++) {              //loop through number of locations in a ship
            if(direction===1) {
                newShipLocations.push(row+""+(col+i));      //new string location pushed into array made of row and col+i (horizontal)
            } else {                                    //*** adding empty string to num(s) results in concatenation (string) ***
                newShipLocations.push((row+i)+""+col);      //new string location pushed into array made of row+i and col (vertical)
            }
        }
        return newShipLocations;                            //once all locations are generated, the array is returned
    },
    generateShipLocations: function() {
        var locations;
        for(var i=0; i<this.numShips; i++) {                //for each ship
            do {
                locations = this.generateShip();            //a new set of locations is generated
            } while(this.collision(locations));             //and is repeated until ships locations don't overlap
            this.ships[i].locations = locations;            //once validated, locations are assigned to the ships[] properties
        }
    },
    collision: function(locations) {
        for(var i=0; i<this.numShips; i++) {                    //loops through each ship...
            var ship = model.ships[i];                          //assigns it to "ship"...
            for(var j=0; j<locations.length; j++) {             //loops through each location...
                if(ship.locations.indexOf(locations[j])>=0) {   //checks if location exists (meaning its index is greater than 0)...
                    return true;                                //if so, it returns true meaning a collision occurs
                }
            }
        }
        return false;                                           //false is returned if no match was found for any location
    },
    fire: function(guess) {
        for(var i=0; i<this.numShips; i++) {
            var ship = this.ships[i];
            var index = ship.locations.indexOf(guess);      //chaining (indexOf -> "locations" within -> "ship")
            if(index>=0) {
                ship.hits[index] = "hit";                   //sets "hit" value to hits' parameter at [index] for ship[i]
                view.displayHit(guess);                     //tells view that it's a hit for it to update HTML
                view.displayMessage("HIT!");
                if(this.isSunk(ship)) {
                    view.displayMessage("DAAAAAAMN, YOU JUST SUNK MY SHIP RIGHT THERE!!")
                    this.shipsSunk++;
                }
                return true;
            }
        }
        view.displayMiss(guess);                            //tells view that guess was a miss for it to update HTML
        view.displayMessage("HAHA, missed.");
        return false;
    },
    isSunk: function(ship) {
        for(var i=0; i<this.shipLength; i++) {              //loops through ship's length
            if(ship.hits[i] !== "hit") {                    //if any of it's "hits" parameters has not got the value "hit"
                return false;                               //the boat is not yet sunk and returns false
            }
        }
        return true;                                        //if all "hits" parameters have the value "hit" it returns true
    }
};

var controller = {
    guesses: 0,
    processGuess: function(guess) {
        var location = parseGuess(guess);                   //assigns returned value from parseGuess() to location
        if(location) {                                      //if value assigned to location isn't null (null = false)
            this.guesses++;                                 //guesses incremented by 1 if guess is valid
            var hit = model.fire(location);                 //location value passed to model.fire() to check if a ship is hit
            if(hit && model.shipsSunk === model.numShips) { //if hit is successful and shipsSunk equals numShips (total of ships)
                view.displayMessage("You sank ALL my battleships in " + this.guesses + " guesses.");
            }
        }
    }
}

function parseGuess(guess) {
    var letters = ["A", "B", "C", "D", "E", "F", "G"];
    if(guess===null || guess.length !== 2) {
        alert("Com'on now, enter a valid guess please.");
    } else {
        var firstChar = guess.charAt(0);                    //grabs guess' first string character (letter from A-G)
        var row = letters.indexOf(firstChar);               //returns an int corresponding to that string character
        var column = guess.charAt(1);                       //grabs guess' second string character (number from 0-6)
        if(isNaN(row) || isNaN(column)) {                   //cheks if none are NaN (non-valid numbers)
            alert("I'm afraid that guess is not on the board.");
        } else if(row<0 || row >= model.boardSize || column<0 || column>=model.boardSize) {    //checks if both are within limits
            alert("Nope, that guess is defo not on the board.");
        } else {
            return row + column;                            //both are concatenated to string as column remained one
        }
    }
    return null;
}

function init() {
    var fireButton = document.getElementById("fireButton"); //finds fireButton within HTML doc by id and assigns to "fireButton"
    fireButton.onclick = handleFireButton;                  //adds click handler function to it and calls handleFireButton()
    var guessInput = document.getElementById("guessInput"); //finds guessInput within HTML doc by id and assigns to "guessInput"
    guessInput.onkeypress = handleKeyPress;                 //adds keypress handler function to it and calls handleKeyPress()
    model.generateShipLocations();
}

function handleFireButton() {
    var guessInput = document.getElementById("guessInput");
    var guess = guessInput.value;                           //assigns its value to "guess"
    controller.processGuess(guess);                         //the guess is then passed to controller.processGuess()
    guessInput.value = "";                                  //resets value of guessInput to an empty string
}

function handleKeyPress(e) {                                //browser passes event object to handler with info about pressed key
    var fireButton = document.getElementById("fireButton");
    if(e.keyCode===13) {                                    //if keyCode is 13 (keyCode for the RETURN key)
        fireButton.click();                                 //.click() called (tricking fireButton to believe it was clicked)
        return false;                                       //false is returned so nothing else is done by the form
    }
}

window.onload = init;                                       //only to run when the page is fully loaded