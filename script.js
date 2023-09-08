// Log:
// 2023-09-05:
//   - Gave up at unit conversions. It's not so hard, just tedious. convertUnits is going in the right direction, but need to return the
//   conversion factor so subsequent scaling can be done for nutrition
//   - addIngredient is broken. Adding that list of ingredients breaks. Could be something to do with spaces
// 2023-09-07:
//   - Started implementing Quantity class. Add a findRatio( newQuantity ) method and we should be good

class Quantity {
    constructor() {
        this.value = null;
        this.unit  = null;
    }

    fromVals( value, unit ) {
        this.value = value;
        this.unit  = unit;
    }

    fromStr( str ) {
        // Get the units of a str (Just look at the suffix)

        // let validUnits = [
        //     "g",
        //     "ml",
        //     "l",
        //     "kg",
        //     "lb",
        //     "oz",
        //     "tbsp",
        //     "tsp",
        // ]

        // Match a potential decimal scalar, potential unlimited spaces, then text suffix
        let reg = /(\d+\.?\d*)\s*(.*)/
        let matches = str.match( reg )
        if( matches === null ) {
            this.value = null;
            this.unit  = null;
            throw new Error("Couldnt parse <scalar value><alphanumeric unit>");
        }
        else {
            this.value = parseFloat(matches[1]);
            this.unit  = matches[2];
        }
    }

    unitIsWeight( unit ) {
        let weightUnits = [ "g", "kg", "lb", "oz" ]

        return weightUnits.includes( unit );
    }

    unitIsVolume( unit ) {
        let volumeUnits = [ "ml", "l", "tbsp", "tsp" ]

        return volumeUnits.includes( unit );
    }

    convertQuantity( newUnit ) {
        // Start by converting the original into grams or liters
        let thisUnitType = null;
        if( this.unitIsVolume(this.unit))
            thisUnitType = "volume";
        else if( this.unitIsWeight(this.unit))
            thisUnitType = "weight";
        else
            thisUnitType = "custom";

        if( thisUnitType == "volume" && ! this.unitIsVolume(newUnit) )
            throw new Error("Original unit is a volume, but new unit is not");
        
        if( thisUnitType == "weight" && ! this.unitIsWeight(newUnit) )
            throw new Error("Original unit is a weight, but new unit is not");

        if( thisUnitType == "custom" && newUnit != this.unit )
            throw new Error("Original unit is a custom unit, but new unit does not match");


        if( thisUnitType == "weight" ) {
            let scaleFactor = 0;

            switch( this.unit ) {
                case "g": scaleFactor = 1.0; break;
                case "kg": scaleFactor = 1000.0; break;
                case "lb": scaleFactor = 453.592; break;
                case "oz": scaleFactor = 28.3495; break;
                default: throw new Error(`Unsupported unit ${this.unit}`);
            }
            
            switch( newUnit ) {
                case "g": scaleFactor /= 1.0; break;
                case "kg": scaleFactor /= 1000.0; break;
                case "lb": scaleFactor /= 453.592; break;
                case "oz": scaleFactor /= 28.3495; break;
            }

            let newQ = new Quantity();
            newQ.fromVals( this.value*scaleFactor, newUnit );
            return [ newQ, scaleFactor ];
        }

        else if( thisUnitType == "volume" ) {
            let scaleFactor = 0;

            switch( this.unit ) {
                case "ml": scaleFactor   = 0.001; break;
                case "l": scaleFactor    = 1.0; break;
                case "tbsp": scaleFactor = 0.0147868; break;
                case "tsp": scaleFactor  = 0.00492892; break;
            }

            switch( newUnit ) {
                case "ml": scaleFactor   /= 0.001; break;
                case "l": scaleFactor    /= 1.0; break;
                case "tbsp": scaleFactor /= 0.0147868; break;
                case "tsp": scaleFactor  /= 0.00492892; break;
            }

            let newQ = new Quantity();
            newQ.fromVals( this.value*scaleFactor, newUnit );
            return [ newQ, scaleFactor ];
        }
        else if( thisUnitType == "custom") {
            let newQ = new Quantity();
            newQ.fromVals( this.value, newUnit );
            return [ newQ, 1.0 ];
        }
    }
}

document.addEventListener("DOMContentLoaded", function() {
    // Your initialization code here

    // console.log( I_O.getIngredient( "chicken1337" ) )

    // console.log( I_O.getUnit( "1337ml" ) )
    // console.log( I_O.getUnit( "1337kek" ) )

    // console.log( I_O.convertUnits( "g", "oz", 28.3495 ) )

    // console.log( I_O.getScalarFromQuantity( "1337.24asdf" ) )
    // console.log( I_O.getScalarFromQuantity( "asdf" ) )

    // // Get references to HTML elements
    // const searchInput = document.getElementById("searchInput");
    // const dropdown = document.getElementById("dropdown");

    // // Event listener to handle item selection
    // dropdown.addEventListener("click", searchClickHandler );
    // searchInput.addEventListener("input", searchInputHandler );

    // addIngredient( "whatever", "slop", "1337ml", 420, 59 )

    // Other initialization tasks


    var q1 = new Quantity();
    q1.fromStr( "2.3 kg" )
    console.log(q1)

    // q2.convertQuantity( "tbsp" )
    newQ = q1.convertQuantity( "lb" )
    console.log( newQ[0], newQ[1] )
});

class Ingredient_Omnissiah {
    constructor() {
        this.ingredients = {};
    }

    addIngredient( ingredientId, ingredientName, quantity, protein, calories ) {
        if (this.ingredients.hasOwnProperty(ingredientId)) {
            alert("Age property exists in the person object");
            return
        }

        var newIngredient = {
            ingredientId: ingredientId,
            ingredientName: ingredientName,
            quantity: quantity,
            protein: protein,
            calories: calories,
        };

        this.ingredients[ingredientId] = newIngredient;

        console.log( this.ingredients ) 
    }

    getIngredient( id ) {
        return {
            ingredientId: this.ingredients[id].ingredientId,
            ingredientName: this.ingredients[id].ingredientName,
            quantity: this.ingredients[id].quantity,
            protein: this.ingredients[id].protein,
            calories: this.ingredients[id].calories,
        }
    }

    getQuantityIngredient( id, quantity ) {
        let ingredient = this.getIngredient( id );
        let originalUnit = this.getUnit( ingredient.quantity );
        let newUnit = this.getUnit( quantity );

        let scalarQuantity = this.getScalarFromQuantity( quantity );
        if( scalarQuantity === null ) {
            return null;
        }

        ingredient.quantity = convertUnits( originalUnit, newUnit, scalarQuantity );




    }
}




var I_O = new Ingredient_Omnissiah();
// I_O.addIngredient( "chicken", "Chicken", "110g", 30, 220 );
// I_O.addIngredient( "Chobani FF Vanilla", "Chobani FF Vanilla",          "10g", 110, 12 )
// I_O.addIngredient( "1 Scoop Shake w/ Collagen", "1 Scoop Shake w/ Collagen",   "10g", 165, 35 )
// I_O.addIngredient( "Bacon, 2 medium slices", "Bacon, 2 medium slices",      "10g", 86, 6 )
// I_O.addIngredient( "Egg", "Egg",                         "10g", 70, 6 )
// I_O.addIngredient( "1 cup Grated Cheddar", "1 cup Grated Cheddar",        "10g", 480, 24 )
// I_O.addIngredient( "1 cup heavy cream", "1 cup heavy cream",           "10g", 821, 4.9 )




// Function to add a new task to the list
function addItem() {
    const newItemText = document.getElementById("newItem").value;
    if (newItemText.trim() !== "") {
        const taskList = document.getElementById("taskList");
        const listItem = document.createElement("li");
        listItem.innerHTML = `<input type="checkbox" onclick="completeItem(this)"> ${newItemText} <button onclick="removeItem(this)">Remove</button>`;
        taskList.appendChild(listItem);
        document.getElementById("newItem").value = ""; // Clear the input field
    }
}

// Function to mark a task as complete
function completeItem(checkbox) {
    const listItem = checkbox.parentElement;
    if (checkbox.checked) {
        listItem.style.textDecoration = "line-through";
    } else {
        listItem.style.textDecoration = "none";
    }
}

// Function to remove a task from the list
function removeItem(button) {
    const listItem = button.parentElement;
    const taskList = document.getElementById("taskList");
    taskList.removeChild(listItem);
}


function ingredientEditHandler(element) {
    const row = element.closest("tr");
    const table = element.closest("table");

    const quantityValue  = element.value;
    const elementId  = element.id;
    const ingredientId  = row.getAttribute("ingredientId"); // Custom attributes have to be fetched like this apparently

    var cellIngredientName = row.cells[0];
    var cellQuantity = row.cells[1];
    var cellCalories = row.cells[2];
    var cellProtein = row.cells[3];

    cellCalories.textContent = String(parseFloat(cellCalories.textContent) * 2);

    updateTotals();
}

function ingredientDeleteHandler(element) {
    const row = element.closest("tr");
    const table = element.closest("table");

    table.deleteRow(row.rowIndex);

    updateTotals();
}

function addIngredient( ingredientId, ingredientName, quantity, calories, protein, ) {
    const table = document.getElementById("ingredientTable");

    const newRow = table.insertRow(table.rows.length);

    newRow.setAttribute( "ingredientId", ingredientId )
    var cellIngredientName = newRow.insertCell(0);
    var cellQuantity = newRow.insertCell(1);
    var cellCalories = newRow.insertCell(2);
    var cellProtein = newRow.insertCell(3);
    var cellActions = newRow.insertCell(4);

    const buttonDelete = document.createElement("button");
    buttonDelete.textContent = "Delete";
    buttonDelete.addEventListener("click", function() { ingredientDeleteHandler(this); });
    cellActions.appendChild( buttonDelete );

    const buttonDuplicate = document.createElement("button");
    buttonDuplicate.textContent = "Duplicate";
    buttonDuplicate.addEventListener("click", function() { ingredientDuplicateHandler(this); });
    cellActions.appendChild( buttonDuplicate );


    cellIngredientName.textContent = ingredientName;

    const quantityInput = document.createElement("input");
    quantityInput.type = "text";
    quantityInput.value = quantity;
    quantityInput.oninput = function() { ingredientEditHandler(this); }
    cellQuantity.appendChild( quantityInput )

    cellCalories.textContent = calories;
    cellProtein.textContent = protein;

    updateTotals();
}


function ingredientDuplicateHandler(element) {
    const row = element.closest("tr");
    const table = element.closest("table");

    const deepClone = row.cloneNode(true);

    table.appendChild( deepClone );

    updateTotals();
}

function updateTotals() {
    const table = document.getElementById("ingredientTable");
    const rows = table.getElementsByTagName("tr");

    const caloriesBox = document.getElementById("caloriesBox");
    const proteinBox = document.getElementById("proteinBox");

    var caloriesTotal = 0.0;
    var proteinTotal = 0.0;

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];

        var cellIngredientName = row.cells[0];
        var cellQuantity = row.cells[1];
        var cellCalories = row.cells[2];
        var cellProtein = row.cells[3];

        console.log( rows )

        caloriesTotal += parseFloat(cellCalories.textContent);
        proteinTotal += parseFloat(cellProtein.textContent);
    }


    caloriesBox.textContent = String(caloriesTotal);
    proteinBox.textContent = String(proteinTotal);

    console.log( caloriesTotal, proteinTotal, caloriesBox )
}


// Event listener for input changes
function searchInputHandler() {
    // Get I_O items here
    let items = [];

    const keys = Object.keys(I_O.ingredients);
    keys.forEach(key => {
        items.push({
            id: I_O.ingredients[key].ingredientId,
            name: I_O.ingredients[key].ingredientName
        });
    });

    const inputValue = searchInput.value.toLowerCase();
    const matchingItems = items.filter(item => item.name.toLowerCase().includes(inputValue));
    
    // Clear the dropdown
    dropdown.innerHTML = "";

    // Populate the dropdown with matching items
    matchingItems.forEach(item => {
        const listItem = document.createElement("a");
        listItem.textContent = item.name;
        listItem.setAttribute( "ingredientId", item.id )
        dropdown.appendChild(listItem);
    });

    // Show or hide the dropdown based on matching items
    if (matchingItems.length > 0) {
        dropdown.style.display = "block";
    } else {
        dropdown.style.display = "none";
    }
}

function searchClickHandler(event) {
    if (event.target.tagName === "A") {
        let ingredientName = event.target.textContent
        let ingredientId   = event.target.getAttribute( "ingredientId" )
        searchInput.value = ingredientName;
        dropdown.style.display = "none";

        ingredient = I_O.getIngredient( ingredientId );

        console.log( ingredient )

        addIngredient( ingredient.ingredientId, ingredient.ingredientName, ingredient.quantity, ingredient.calories, ingredient.protein );
    }
}

