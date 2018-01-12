/**
 * Akhil Dalal
 * 100855466
 * Assignment 2 - Client-Side javascript.
 *
 * Uses AJAX to serve and update file contents.
 */
var currentFile; // track what's currently being viewed.

// Run everything once page has loaded -
// Populate the dropdown and add eventlisteners to the buttons.
window.addEventListener('load', function(){
	populateRecipes();
	var viewButton = document.getElementById("view");
	var updateButton = document.getElementById("update");

	viewButton.addEventListener('click', populateEditor);
	updateButton.addEventListener('click', updateFiles);
});

// R2.1
// Uses AJAX to request for a json object that has an array 
// of filenames in the recipes directory.
// input: no input parameters - just simple GET request for filenames in a directory.
// output: no returns - the drop down on the webpage will be populated with the available recipes.
function populateRecipes(){
	var xhr = new XMLHttpRequest();

	xhr.open("GET", "/recipes/");

	xhr.addEventListener('load', function(){
		
		// parse the object
		var recipeList = JSON.parse(xhr.responseText).list;
		
		var select = document.getElementById("recipeSelect");

		var toParse;
		
		// for each filename in the array, parse it and display it as an option.
		for (var i in recipeList){
			// remove underscores and extension.
			toParse = recipeList[i];
			toParse = toParse.slice(0, toParse.indexOf('.'));
			toParse = toParse.split('_').join(" ");

			select.add( new Option(toParse));
		}
	});

	xhr.send();
}

// R2.2
// Uses AJAX to request for the contents of the selected recipe.
// Display's that content in the editor.
// input: no input parameters - just simple GET request for file contents.
// output: no return - uses the server response to populate the editor textareas on the webpage.
function populateEditor() {
	
	// Editor area is invisible at the beginning, make it visible.
	var setVisible = document.getElementById("editor");
    
	setVisible.style.visibility = "visible";

	var xhr = new XMLHttpRequest();

	var select = document.getElementById("recipeSelect");
	
	// Get the selected recipe and add the _ and .json back.
	var toParse = select.options[select.selectedIndex].value;
	currentFile = toParse;
	toParse = toParse.split(" ").join("_");
	toParse += ".json";

	xhr.open("GET", "/recipes/" + toParse);

	xhr.addEventListener('load', function(){
		var recipeObj = JSON.parse(xhr.responseText);

		// get all text areas on the webpage
		var duration = document.getElementById("recDuration");
		var ingredients = document.getElementById("recIngredients");
		var steps = document.getElementById("recSteps");
		var notes = document.getElementById("recNotes");

		// show content in the respective areas
		duration.value = recipeObj.duration;
		ingredients.value = recipeObj.ingredients.join("\n");
		steps.value = recipeObj.directions.join("\n");
		notes.value = recipeObj.notes;
	});

	xhr.send();
}

// R2.3
// Uses AJAX to send editor contents to the server.
// The server then overwrites the respective file.
// input: no input parameters.
// output: no output - just a simple post of data to the server.
function updateFiles() {
	// see if user has viewed first.
	var visibleCheck = document.getElementById("editor");
	var select = document.getElementById("recipeSelect");
	
	// if user hasn't viewed something on first run, then show a warning.
	if(visibleCheck.style.visibility === "visible"){
		// check if user is updating the correct file
		// i.e. he has clicked view and hasn't selected another file without pressing view.
		if (select.options[select.selectedIndex].value === currentFile) {
			
			// get necessary elements
			var duration = document.getElementById("recDuration");
			var ingredients = document.getElementById("recIngredients");
			var steps = document.getElementById("recSteps");
			var notes = document.getElementById("recNotes");

			// start ajaxing
			var xhr = new XMLHttpRequest();
			
			// Get the selected recipe and add the _ and .json back.
			var toParse = currentFile;
			toParse = toParse.split(" ").join("_");
			toParse += ".json";
			xhr.open("POST", "/recipes/"+toParse);

			xhr.setRequestHeader("Content-Type", "application/json");

			// build JSON to send;
			var recipeUpdate = {};
			recipeUpdate.name = select.options[select.selectedIndex].value;
			recipeUpdate.duration = duration.value;
			recipeUpdate.ingredients = ingredients.value.split("\n");
			recipeUpdate.directions = steps.value.split("\n");
			recipeUpdate.notes = notes.value;

			xhr.send(JSON.stringify(recipeUpdate));
			
			checkmarkToggle("./check_mark.png", 3000);
		} else {
			var warning = "";
			warning = "<p>You're trying to update the recipe for \"" + select.options[select.selectedIndex].value +  "\"";			
			warning += " with the recipe for \"" + currentFile + "\"</p>";
			warning += "<p>Please select the right recipe!</p>";
			
			warningToggle(warning, 4000);
		}
	} else {
		warningToggle("<p>You haven't selected a recipe to update yet!</p>", 3000);
	}
}

// toggles warning and only displays it for "delay" milliseconds.
// input: warn - the warning to display
// input: delay - how long to set the timeout for.
// returns: nothing.
function warningToggle(warn, delay) {
	var target  = document.getElementById("warning");
	target.innerHTML = warn;
	var targetOut = window.setTimeout(function(){target.innerHTML=""}, delay);
	
	checkmarkToggle("./cross.png", delay);
}

// toggles a checkmark or a cross and only displays it for "delay" milliseconds.
// input: 
function checkmarkToggle(img, delay){
	var target = document.getElementById("check");
	target.setAttribute("src", img);
	target.style.display = "inline";
	var checkInvis = window.setTimeout(function(){target.style.display = "none"}, delay);
}