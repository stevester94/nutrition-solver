// TODO:
// 2023-09-09:
//   Gave up at unit conversions. It's not so hard, just tedious. convertUnits is going in the right direction, but need to return the
//   conversion factor so subsequent scaling can be done for nutrition

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
            quantity: this.ingredients[id].quantity,
            protein: this.ingredients[id].protein,
            calories: this.ingredients[id].calories,
        }
    }

    getQuantityIngredient( id, quantity ) {
        ingredient = this.getIngredient( id );
        let originalUnit = this.getUnit( ingredient.quantity );
        let newUnit = this.getUnit( quantity );

        let scalarQuantity = this.getScalarFromQuantity( quantity );
        if( scalarQuantity === null ) {
            return null;
        }

        ingredient.quantity = convertUnits( originalUnit, newUnit, scalarQuantity );




    }

    // Get the units of a str (Just look at the suffix)
    getUnit( s ) {
        let validUnits = [
            "g",
            "ml",
            "l",
            "kg",
            "lb",
            "oz",
            "tbsp",
            "tsp",
        ]

        for( let i=0; i < validUnits.length; i++ ) {
            let regex = new RegExp(`${validUnits[i]}$`)
            if( regex.test( s )) {
                return validUnits[i];
            }
        }
        
        return null;
    }

    unitIsWeight( unit ) {
        let weightUnits = [ "g", "kg", "lb", "oz" ]

        return weightUnits.includes( unit );
    }

    unitIsVolume( unit ) {
        let volumeUnits = [ "ml", "l", "tbsp", "tsp" ]

        return volumeUnits.includes( unit );
    }

    getScalarFromQuantity( quantity ) {
        let reg = /([0-9]*\.[0-9]).*/
        let matches = quantity.match( reg )
        if( matches === null ) {
            return null;
        }
        else {
            return matches[1];
        }
    }

    convertUnits( originalUnit, newUnit, originalQuantity ) {
        // Start by converting the original into grams or liters
        if( this.unitIsWeight( originalUnit )) {
            if( ! this.unitIsWeight( newUnit )) {
                return null;
            }

            let originalInGrams = originalQuantity;

            switch( originalUnit ) {
                case "g": originalInGrams *= 1.0; break;
                case "kg": originalInGrams *= 1000.0; break;
                case "lb": originalInGrams *= 453.592; break;
                case "oz": originalInGrams *= 28.3495; break;
            }
            
            switch( newUnit ) {
                case "g": return originalInGrams / 1.0;
                case "kg": return originalInGrams / 1000.0;
                case "lb": return originalInGrams / 453.592;
                case "oz": return originalInGrams / 28.3495;
            }
        }
        else if( this.unitIsVolume( originalUnit )) {
            if( ! this.unitIsVolume( newUnit )) {
                return null;
            }

            let originalInLiters = originalQuantity;

            switch( originalUnit ) {
                case "ml": originalInLiters *= 0.001; break;
                case "l": originalInLiters *= 1.0; break;
                case "tbsp": originalInLiters *= 0.0147868; break;
                case "tsp": originalInLiters *= 0.00492892; break;
            }

            switch( newUnit ) {
                case "ml": return originalInLiters / 0.001;
                case "l": return originalInLiters / 1.0;
                case "tbsp": return originalInLiters / 0.0147868;
                case "tsp": return originalInLiters / 0.00492892;
            }
        }
        else {
            return null;
        }
    }

}

var I_O = new Ingredient_Omnissiah();
I_O.addIngredient( "chicken1337", "Chicken", "110g", 30, 220 );


document.addEventListener("DOMContentLoaded", function() {
    // Your initialization code here

    console.log( I_O.getIngredient( "chicken1337" ) )

    console.log( I_O.getUnit( "1337ml" ) )
    console.log( I_O.getUnit( "1337kek" ) )

    console.log( I_O.convertUnits( "g", "oz", 28.3495 ) )

    console.log( I_O.getScalarFromQuantity( "1337.24asdf" ) )
    console.log( I_O.getScalarFromQuantity( "asdf" ) )

    // Get references to HTML elements
    const searchInput = document.getElementById("searchInput");
    const dropdown = document.getElementById("dropdown");

    // Event listener to handle item selection
    dropdown.addEventListener("click", searchClickHandler );
    searchInput.addEventListener("input", searchInputHandler );

    addIngredient( "whatever", "slop", "1337ml", 420, 59 )

    // Other initialization tasks
});


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
    cellQuantity.textContent = quantity;
    cellCalories.textContent = calories;
    cellProtein.textContent = protein;
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
    let items = []

    console.log( I_O );

    const keys = Object.keys(I_O.ingredients);
    keys.forEach(key => {
        items.push(
            I_O.ingredients[key].ingredientName
        );
    });

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
        let selection = event.target.textContent
        searchInput.value = selection;
        dropdown.style.display = "none";

        addIngredient( selection, selection, "1337ml", 420, 59 )
    }
}

