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

    toStr() {
        return String(this.value) + " " + this.unit;
    }

    static fromVals( value, unit ) {
        let q = new Quantity();
        q.fromVals( value, unit );
        return q;
    }

    static fromStr( s ) {
        let q = new Quantity();
        q.fromStr( s );
        return q;
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
        let reg = /(\d+\.?\d*)\s*(.+)/
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

    // The ratio from this is used to scale the original ingredient
    getQuantityRatio( otherQuantity ) {
        let tempQ = this.convertQuantity( otherQuantity.unit );
        return otherQuantity.value / tempQ.value;
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
            return newQ
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
            return newQ
        }
        else if( thisUnitType == "custom") {
            let newQ = new Quantity();
            newQ.fromVals( this.value, newUnit );
            return newQ
        }
    }
}

function assert( muhBool ) {
    if( ! muhBool ) {
        throw new Error( "Bad assert" );
    }
}

function assertFloatsAlmostEqual(a, b, epsilon = 0.001) {
    if (Math.abs(a - b) > epsilon) {
      throw new Error(`Assertion failed: ${a} is not approximately equal to ${b}`);
    }
  }

function testQuantityClass() {
    // Basic quantity conversions
    var q1 = new Quantity();
    q1.fromStr( "2.3 kg" )
    var q2 = new Quantity();
    q2.fromStr( "2.3 lb" )
    assertFloatsAlmostEqual( q1.getQuantityRatio( q2 ), 0.453592 )

    q1.fromStr( "10 scoops" )
    q2.fromStr( "10 scoops" )
    assertFloatsAlmostEqual( q1.getQuantityRatio( q2 ), 1.0 )

    q1.fromStr( "10 scoops" )
    q2.fromStr( "5 scoops" )
    assertFloatsAlmostEqual( q1.getQuantityRatio( q2 ), 0.5 )

    q1.fromStr( "1 scoops" )
    q2.fromStr( "5 scoops" )
    assertFloatsAlmostEqual( q1.getQuantityRatio( q2 ), 5 )

    q1.fromStr( "2.3 lb" )
    q2.fromStr( "2.3 kg" )
    assertFloatsAlmostEqual( q1.getQuantityRatio( q2 ), 1.0/0.453592 )

    
    // Check '5' throws error
    let error;
    try { error = false; q2.fromStr( "5" ) }
    catch { error = true; }
    finally { assert( error ) }
    
    // 5 fug is valid
    try { error = false; q2.fromStr( "5fug" ); }
    catch { error = true; }
    finally { assert( !error ) }

    try { error = false; q2.fromStr( "5 fug" ); }
    catch { error = true; }
    finally { assert( !error ) }

    q1.fromStr( "2.3perflunks" )
    assert( q1.toStr() === "2.3 perflunks" );
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
    dropdown.addEventListener("click", searchClickHandler );
    searchInput.addEventListener("input", searchInputHandler );

    // addIngredient( "whatever", "slop", "1337ml", 420, 59 )

    // Other initialization tasks


    testQuantityClass()
});

class Ingredient_Omnissiah {
    constructor() {
        this.ingredients = new Map();
    }

    addIngredient( ingredientName, quantity, calories, protein ) {
        if (this.ingredients.has(ingredientName)) {
            throw new Error( `${ingredientName} already exists in Ingredient_Omnissiah` )
        }

        var newIngredient = {
            ingredientName: ingredientName,
            quantity: quantity,
            protein: protein,
            calories: calories,
        };

        console.log( newIngredient )

        this.ingredients.set(ingredientName, newIngredient);
    }

    getIngredient( name ) {
        return this.ingredients.get( name );
    }

    scaleIngredient( name, newQuantity ) {
        let ingredient = this.ingredients.get( name );
        let ratio = ingredient.quantity.getQuantityRatio( newQuantity );

        // The absolute state of this shitty fucking language
        var scaled = JSON.parse(JSON.stringify(ingredient));

        scaled.quantity = newQuantity;
        scaled.protein *= ratio;
        scaled.calories *= ratio;

        return scaled;
    }
}




var I_O = new Ingredient_Omnissiah();
I_O.addIngredient( "Chicken",                   Quantity.fromStr("110g"), 220, 30 );
I_O.addIngredient( "Chobani FF Vanilla",        Quantity.fromStr("10 g"), 110, 12 )
I_O.addIngredient( "1 Scoop Shake w/ Collagen", Quantity.fromStr("1 scoop"), 165, 35 )
I_O.addIngredient( "Bacon, 2 medium slices",    Quantity.fromStr("10 g"), 86, 6 )
I_O.addIngredient( "Egg",                       Quantity.fromStr("10  g"), 70, 6 )
I_O.addIngredient( "1 cup Grated Cheddar",      Quantity.fromStr("10g"), 480, 24 )
I_O.addIngredient( "1 cup heavy cream",         Quantity.fromStr("10g"), 821, 4.9 )

console.log(
    I_O.scaleIngredient( "Egg", Quantity.fromStr("100g") )
)


function quantityEditHandler(element) {
    const row = element.closest("tr");
    const table = element.closest("table");

    const quantityValue  = element.value;
    const elementId  = element.id;

    var cellIngredientName = row.cells[0];
    var cellQuantity = row.cells[1];
    var cellCalories = row.cells[2];
    var cellProtein = row.cells[3];

    let quant = null;
    try {
        quant = Quantity.fromStr( cellQuantity.querySelector('input').value );
        let scaledIngredient = I_O.scaleIngredient( cellIngredientName.textContent, quant )
        cellCalories.textContent = String(parseFloat(scaledIngredient.calories));
        cellProtein.textContent = String(parseFloat(scaledIngredient.protein));
    }
    catch( error ) {
        // TODO: Make the cell red or something
    }

    updateTotals();
}

function ingredientDeleteHandler(element) {
    const row = element.closest("tr");
    const table = element.closest("table");

    table.deleteRow(row.rowIndex);

    updateTotals();
}

function addIngredient( ingredientName, quantity, calories, protein, ) {
    const table = document.getElementById("ingredientTable");

    const newRow = table.insertRow(table.rows.length);

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
    quantityInput.value = quantity.toStr();
    quantityInput.oninput = function() { quantityEditHandler(this); }
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

        caloriesTotal += parseFloat(cellCalories.textContent);
        proteinTotal += parseFloat(cellProtein.textContent);
    }


    caloriesBox.textContent = String(caloriesTotal);
    proteinBox.textContent = String(proteinTotal);
}


// Event listener for input changes
function searchInputHandler() {
    // Get I_O items here
    let items = Array.from( I_O.ingredients.keys() );

    const inputValue = searchInput.value.toLowerCase();
    const matchingItems = items.filter(item => item.toLowerCase().includes(inputValue));
    
    // Clear the dropdown
    dropdown.innerHTML = "";

    // Populate the dropdown with matching items
    matchingItems.forEach(item => {
        const listItem = document.createElement("a");
        listItem.textContent = item;
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
        searchInput.value = ingredientName;
        dropdown.style.display = "none";

        ingredient = I_O.getIngredient( ingredientName );

        addIngredient( ingredient.ingredientName, ingredient.quantity, ingredient.calories, ingredient.protein );
    }
}

