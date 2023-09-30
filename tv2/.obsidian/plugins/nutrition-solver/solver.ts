// Log:
// 2023-09-05:
//   - Gave up at unit conversions. It's not so hard, just tedious. convertUnits is going in the right direction, but need to return the
//   conversion factor so subsequent scaling can be done for nutrition
//   - addIngredient is broken. Adding that list of ingredients breaks. Could be something to do with spaces
// 2023-09-07:
//   - Started implementing Quantity class. Add a findRatio( newQuantity ) method and we should be good

import { ButtonComponent } from "obsidian";
import { resourceUsage } from "process";

export class Ingredient {
    public name:string;
    public quantity:Quantity;
    public protein:number;
    public calories:number;

    scale( newQuantity:Quantity ) {
        let ratio = this.quantity.getQuantityRatio( newQuantity );

        this.quantity = newQuantity
        this.protein *= ratio
        this.calories *= ratio
    }
}

class Recipe {
    public ingredients:Array<Ingredient>
    public numServings:number

    constructor() {
        this.ingredients = []
    }

    totalCalories():number {
        let cals = 0.0
        this.ingredients.forEach( ing=> {
            cals += ing.calories
        })
        return cals
    }

    totalProtein():number {
        let pro = 0.0
        this.ingredients.forEach( ing => {
            pro += ing.protein
        })

        return pro
    }

    caloriesPerServing():number {
        return this.totalCalories()/this.numServings
    }

    proteinPerServing():number {
        return this.totalProtein()/this.numServings
    }
}

export class Quantity {
    public value: number;
    public unit: string;
    constructor() {
        this.value = 0;
        this.unit  = "";
    }

    fromVals( value: number, unit: string ) {
        this.value = value;
        this.unit  = unit;
    }

    toStr() {
        return String(this.value) + " " + this.unit;
    }

    static fromVals( value: number, unit:string ) {
        let q = new Quantity();
        q.fromVals( value, unit );
        return q;
    }

    static fromStr( s:string ) {
        let q = new Quantity();
        q.fromStr( s );
        return q;
    }

    fromStr( str:string ) {
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
            this.value = 0;
            this.unit  = "";
            throw new Error("Couldnt parse <scalar value><alphanumeric unit>");
        }
        else {
            this.value = parseFloat(matches[1]);
            this.unit  = matches[2];
        }
    }

    unitIsWeight( unit:string ):boolean {
        let weightUnits = [ "g", "kg", "lb", "oz" ]

        return weightUnits.includes( unit );
    }

    unitIsVolume( unit:string ):boolean {
        let volumeUnits = [ "ml", "l", "tbsp", "tsp" ]

        return volumeUnits.includes( unit );
    }

    // The ratio from this is used to scale the original ingredient
    getQuantityRatio( otherQuantity:Quantity ) {
        let tempQ = this.convertQuantity( otherQuantity.unit );

        if( tempQ === undefined )
            return -1 //  guard on undefined tempQ
        else
            return otherQuantity.value / tempQ.value;
    }

    convertQuantity( newUnit:string ) {
        // Start by converting the original into grams or liters
        let thisUnitType:string = "";
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

function assert( muhBool:boolean ) {
    if( ! muhBool ) {
        throw new Error( "Bad assert" );
    }
}

function assertFloatsAlmostEqual(a:number, b:number, epsilon = 0.001) {
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
    let error:boolean = false;
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

// document.addEventListener("DOMContentLoaded", function() {
//     // Your initialization code here

//     // console.log( I_O.getIngredient( "chicken1337" ) )

//     // console.log( I_O.getUnit( "1337ml" ) )
//     // console.log( I_O.getUnit( "1337kek" ) )

//     // console.log( I_O.convertUnits( "g", "oz", 28.3495 ) )

//     // console.log( I_O.getScalarFromQuantity( "1337.24asdf" ) )
//     // console.log( I_O.getScalarFromQuantity( "asdf" ) )

//     // // Get references to HTML elements
//     // const searchInput = document.getElementById("searchInput");
//     // const dropdown = document.getElementById("dropdown");

//     // // Event listener to handle item selection
//     dropdown.addEventListener("click", searchClickHandler );
//     searchInput.addEventListener("input", searchInputHandler );

//     // addIngredient( "whatever", "slop", "1337ml", 420, 59 )

//     // Other initialization tasks


//     testQuantityClass()
// });

export class Ingredient_Omnissiah {
    public ingredients: Map<string, Ingredient>;

    constructor() {
        this.ingredients = new Map();
    }

    addIngredient( ingredientName:string, quantity:Quantity, calories:number, protein:number ) {
        if (this.ingredients.has(ingredientName)) {
            throw new Error( `${ingredientName} already exists in Ingredient_Omnissiah` )
        }

        var newIngredient = new Ingredient()

        newIngredient.name = ingredientName
        newIngredient.quantity = quantity
        newIngredient.protein = protein
        newIngredient.calories = calories


        this.ingredients.set(ingredientName, newIngredient);
    }

    getIngredient( name:string ):Ingredient {
        let ret = this.ingredients.get( name )
        if( ret === undefined ) {
            throw new Error( `couldn't find ingredient ${name}` )
        } else {
            return ret
        }
    }
}

export class Solver {
    private top_: Element;
    private btn_ : HTMLButtonElement;
    private table_ : HTMLTableElement;
    private I_O_ : Ingredient_Omnissiah;
    private calSpan_ : HTMLSpanElement;
    private proSpan_ : HTMLSpanElement;

    private searchInput_ : HTMLInputElement;
    private dropdown_ : HTMLDivElement;

    private servingsInput_: HTMLInputElement;

    private calPerServingSpan_ : HTMLSpanElement;
    private proPerServingSpan_ : HTMLSpanElement;

    private recipeJson_ : HTMLTextAreaElement

    private recipe_ : Recipe


    constructor( top:Element, I_O:Ingredient_Omnissiah ) {
        this.top_ = top;
        this.I_O_ = I_O;
        this.recipe_ = new Recipe()
        this.recipe_.numServings = 8


        this.top_.createEl( "h1", { text: "Search Ingredients"} )
        this.top_.createEl( "div", { cls: "search-container" } )
        this.searchInput_ = this.top_.createEl( "input", { cls: "dropdown-input", type: "text", placeholder: "Search..." } )
        this.searchInput_.id = "searchInput";
        this.searchInput_.addEventListener("input", () => this.searchInputHandler(this) );

        this.dropdown_ = this.top_.createEl( "div", { cls: "dropdown-content", } );
        this.dropdown_.id = "dropdown";
        this.dropdown_.addEventListener("click", (e) => this.searchClickHandler(this, e) );
        // this.dropdown_.addEventListener("click", this.searchClickHandler );

        this.top_.createEl( "h1").setText( "Ingredients")
        this.table_ = this.top_.createEl( "table" )
        let row = this.table_.createEl( "tr" )
        row.createEl( "th" ).setText( "Item" )
        row.createEl( "th" ).setText( "Quantity" )
        row.createEl( "th" ).setText( "Calories" )
        row.createEl( "th" ).setText( "Protein" )
        row.createEl( "th" ).setText( "Actions" )

        let calP = this.top_.createEl("p")
        calP.setText( "Total Calories: " )
        this.calSpan_ = calP.createEl( "span");

        let proP = this.top_.createEl("p")
        proP.setText( "Total Protein: " )
        this.proSpan_ = proP.createEl( "span");

        this.top_.createEl( "span" ).setText( "Servings: ")
        this.servingsInput_ = this.top_.createEl( "input", { type: "text" } )
        this.servingsInput_.id = "servingsInput"
        this.servingsInput_.defaultValue = String(this.recipe_.numServings);
        // this.servingsInput_.addEventListener( "input", () => this.updateTotals() ) // BROKEN

        let calServSpan = this.top_.createEl( "p" )
        calServSpan.setText( "Calories per serving: " )
        this.calPerServingSpan_ = calServSpan.createEl( "span" )

        let proServSpan = this.top_.createEl( "p" )
        proServSpan.setText( "Protein per serving: " )
        this.proPerServingSpan_ = proServSpan.createEl( "span" )

        this.recipeJson_ = this.top_.createEl( "textarea" )
        // this.recipeJson_.addEventListener( "input", () => this.textAreaEditHandler() ) // BROKEN

    }

    buildTable() {
        console.log( "BUILD" )
        console.log(this.recipe_.ingredients)

        console.log( "Building, this.table_.rows.length:", this.table_.rows.length)
        while( this.table_.rows.length > 1) {
            this.table_.deleteRow( 1 )
        }

        this.recipe_.ingredients.forEach( ing => {
            this.addRow( ing.name, ing.quantity, ing.calories, ing.protein )
        })

        this.calSpan_.textContent = String( this.recipe_.totalCalories() )
        this.proSpan_.textContent = String( this.recipe_.totalProtein() )

        this.calPerServingSpan_.textContent = String( this.recipe_.caloriesPerServing() )
        this.proPerServingSpan_.textContent = String( this.recipe_.proteinPerServing()  )
    }

    addRow( name:string, quantity: Quantity, calories: number, protein: number ) {
        let row = this.table_.createEl( "tr" );
        row.createEl( "td" ).setText( name )

        let quantityCell = row.createEl( "td" )
        let quantityInput = quantityCell.createEl( "input" )
        quantityInput.value = quantity.toStr()
        quantityInput.oninput = (e) => this.editHandler( e, row );

        
        let calCell = row.createEl( "td",  )
        calCell.id = "calories";
        calCell.setText( String(calories) );

        let proCell = row.createEl( "td" )
        proCell.setText( String(protein) )
        proCell.id = "protein"

        let actions = row.createEl( "td" );

        let delBtn = actions.createEl("button");
        delBtn.setText( "Delete" )
        delBtn.addEventListener( "click", (e) => this.deleteHandler(e, row) )
    }

    deleteHandler(e:Event, row:HTMLTableRowElement) {
        console.log( "Delete idx", row.rowIndex-1 )
        this.recipe_.ingredients.splice( row.rowIndex-1, 1 ) // -1 because of the header
        this.buildTable()
    }

    editHandler( e:Event, row:HTMLTableRowElement ) {
        // var cellIngredientName = row.cells[0];
        // var cellQuantity = row.cells[1];
        // var cellCalories = row.cells[2];
        // var cellProtein = row.cells[3];

        // let quant = null;

        // try {
        //     quant = Quantity.fromStr( cellQuantity.getElementsByTagName('input')[0].value );
        //     // console.log( "Parsed quantity: ", quant )
        //     if( cellIngredientName.textContent !== null) {
        //         let scaledIngredient = this.I_O_.scaleIngredient( cellIngredientName.textContent, quant )
        //         cellCalories.textContent = String(scaledIngredient.calories);
        //         cellProtein.textContent = String(scaledIngredient.protein);
        //     }
        // }
        // catch( error ) {
        //     // TODO: Make the cell red or something
        // }

        // this.updateTotals();
    }

    // buildRecipe( caloriesTotal:number, proteinTotal:number, numServings:number ):string {
    //     let recipe = new Recipe
    //     for( let i = 1; i < this.table_.rows.length; i++ ) {
    //         const row = this.table_.rows[i];
    //         // console.log("adsf", row )

    //         var ingredientName = row.cells[0].textContent;
    //         var quantity = row.cells[1].getElementsByTagName('input')[0].value;
    //         var calories = row.cells[2].textContent;
    //         var protein = row.cells[3].textContent;
            
    //         // { "name": "chicken", "calories": 100, "protein": 20, "quantity": "20g" }
    //         if( ingredientName !== null )
    //         {
    //             recipe.ingredients.push(
    //                 this.I_O_.scaleIngredient( ingredientName, Quantity.fromStr( quantity ))
    //             )
    //         }
    //     }

    //     recipe.caloriesTotal = caloriesTotal
    //     recipe.proteinTotal = proteinTotal
    //     recipe.proteinPerServing = proteinTotal/numServings
    //     recipe.caloriesPerServing = caloriesTotal/numServings
    //     recipe.numServings = numServings

    //     return JSON.stringify( recipe )
    // }

    // loadFromRecipe( recipe:Recipe ) {
    //     for( let i = 1; i < this.table_.rows.length; i++ ) {
    //         this.table_.deleteRow( i )
    //     }

    //     recipe.ingredients.forEach( ingredient => {
    //         let ing = this.I_O_.scaleIngredient( ingredient.name, ingredient.quantity )
    //         this.addRow( ing.name, ing.quantity, ing.calories, ing.protein );
    //     })
    // }

    // textAreaEditHandler() {
    //     // Parse out recipe then load it
    //     let recipe = new Recipe()
    //     let j = []
    //     try {
    //         j = JSON.parse( this.recipeJson_.value )
    //         recipe = j
    //         this.loadFromRecipe( recipe )
    //     } catch( erro ) {
    //         // TODO: Turn the recipe box red
    //         return
    //     }

    //     // this.updateTotals(false)
    // }

    searchInputHandler( s: Solver ) {
        // Get I_O items here
        // console.log( this );
        // return;

        let items = Array.from( s.I_O_.ingredients.keys() );
    
        const inputValue = s.searchInput_.value.toLowerCase();
        const matchingItems = items.filter(item => item.toLowerCase().includes(inputValue));
        
        // Clear the dropdown
        s.dropdown_.innerHTML = "";
    
        // Populate the dropdown with matching items
        matchingItems.forEach(item => {
            const listItem = document.createElement("a");
            listItem.textContent = item;
            this.dropdown_.appendChild(listItem);
        });
    
        // Show or hide the dropdown based on matching items
        if (matchingItems.length > 0) {
            s.dropdown_.style.display = "block";
        } else {
            s.dropdown_.style.display = "none";
        }
    }
    
    searchClickHandler(s:Solver, event:MouseEvent,) {
    // searchClickHandler(event:Event) {
        // console.log( event.targetNode )
        // console.log( "Event", event )
        // console.log( "currentTarget", event.target )
        // if (event.target === "A") {
            if( event.targetNode === null )
                return

            // event.targetNode.tex``
            let ingredientName = event.targetNode.textContent

            if( ingredientName === null )
                return

            this.searchInput_.value = ingredientName;
            this.dropdown_.style.display = "none";
    
            let ingredient = s.I_O_.getIngredient( ingredientName );

            if( ingredient === undefined )
                return
    
            this.recipe_.ingredients.push( ingredient )

            this.buildTable()
        // }
    }



}


// function quantityEditHandler(element) {
//     const row = element.closest("tr");
//     const table = element.closest("table");

//     const quantityValue  = element.value;
//     const elementId  = element.id;

//     var cellIngredientName = row.cells[0];
//     var cellQuantity = row.cells[1];
//     var cellCalories = row.cells[2];
//     var cellProtein = row.cells[3];

//     let quant = null;
//     try {
//         quant = Quantity.fromStr( cellQuantity.querySelector('input').value );
//         console.log( "Parsed quantity: ", quant )
//         let scaledIngredient = I_O.scaleIngredient( cellIngredientName.textContent, quant )
//         cellCalories.textContent = String(parseFloat(scaledIngredient.calories));
//         cellProtein.textContent = String(parseFloat(scaledIngredient.protein));
//     }
//     catch( error ) {
//         // TODO: Make the cell red or something
//     }

//     updateTotals();
// }

// function ingredientDeleteHandler(element) {
//     const row = element.closest("tr");
//     const table = element.closest("table");

//     table.deleteRow(row.rowIndex);

//     updateTotals();
// }

// function addIngredient( ingredientName, quantity, calories, protein, ) {
//     const table = document.getElementById("ingredientTable");

//     const newRow = table.insertRow(table.rows.length);

//     var cellIngredientName = newRow.insertCell(0);
//     var cellQuantity = newRow.insertCell(1);
//     var cellCalories = newRow.insertCell(2);
//     var cellProtein = newRow.insertCell(3);
//     var cellActions = newRow.insertCell(4);

//     const buttonDelete = document.createElement("button");
//     buttonDelete.textContent = "Delete";
//     buttonDelete.addEventListener("click", function() { ingredientDeleteHandler(this); });
//     cellActions.appendChild( buttonDelete );

//     const buttonDuplicate = document.createElement("button");
//     buttonDuplicate.textContent = "Duplicate";
//     buttonDuplicate.addEventListener("click", function() { ingredientDuplicateHandler(this); });
//     cellActions.appendChild( buttonDuplicate );


//     cellIngredientName.textContent = ingredientName;

//     const quantityInput = document.createElement("input");
//     quantityInput.type = "text";
//     quantityInput.value = quantity.toStr();
//     quantityInput.oninput = function() { quantityEditHandler(this); }
//     cellQuantity.appendChild( quantityInput )

//     cellCalories.textContent = calories;
//     cellProtein.textContent = protein;

//     updateTotals();
// }


// function ingredientDuplicateHandler(element) {
//     const row = element.closest("tr");
//     const table = element.closest("table");

//     var cellIngredientName = row.cells[0];
//     var cellQuantity = row.cells[1];
//     var cellCalories = row.cells[2];
//     var cellProtein = row.cells[3];

//     let name = cellIngredientName.textContent;
//     let quant = Quantity.fromStr( cellQuantity.querySelector('input').value );
//     let calories = parseFloat(cellCalories.textContent);
//     let protein  = parseFloat(cellProtein.textContent);

//     addIngredient( name,quant,calories,protein );
//     // addIngredient( ingredient.ingredientName, ingredient.quantity, ingredient.calories, ingredient.protein );
// }

// function updateTotals() {
//     const table = document.getElementById("ingredientTable");
//     const rows = table.getElementsByTagName("tr");

//     const caloriesBox = document.getElementById("caloriesBox");
//     const proteinBox = document.getElementById("proteinBox");

//     var caloriesTotal = 0.0;
//     var proteinTotal = 0.0;

//     for (let i = 1; i < rows.length; i++) {
//         const row = rows[i];

//         var cellIngredientName = row.cells[0];
//         var cellQuantity = row.cells[1];
//         var cellCalories = row.cells[2];
//         var cellProtein = row.cells[3];

//         caloriesTotal += parseFloat(cellCalories.textContent);
//         proteinTotal += parseFloat(cellProtein.textContent);
//     }


//     caloriesBox.textContent = String(caloriesTotal);
//     proteinBox.textContent = String(proteinTotal);
// }


// // Event listener for input changes
// function searchInputHandler() {
//     // Get I_O items here
//     let items = Array.from( I_O.ingredients.keys() );

//     const inputValue = searchInput.value.toLowerCase();
//     const matchingItems = items.filter(item => item.toLowerCase().includes(inputValue));
    
//     // Clear the dropdown
//     dropdown.innerHTML = "";

//     // Populate the dropdown with matching items
//     matchingItems.forEach(item => {
//         const listItem = document.createElement("a");
//         listItem.textContent = item;
//         dropdown.appendChild(listItem);
//     });

//     // Show or hide the dropdown based on matching items
//     if (matchingItems.length > 0) {
//         dropdown.style.display = "block";
//     } else {
//         dropdown.style.display = "none";
//     }
// }

// function searchClickHandler(event) {
//     if (event.target.tagName === "A") {
//         let ingredientName = event.target.textContent
//         searchInput.value = ingredientName;
//         dropdown.style.display = "none";

//         ingredient = I_O.getIngredient( ingredientName );

//         addIngredient( ingredient.ingredientName, ingredient.quantity, ingredient.calories, ingredient.protein );
//     }
// }

