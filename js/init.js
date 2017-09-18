///////////////////
/* Global Setup */
/////////////////

var loading = true;

// global variables to calculate movement
var difX = 0;
var difY = 0;
var sX = 0;
var sY = 0;
var movement = false;

//////////////////
/* Level Setup */
////////////////

var maps = initMap(100, 100);
var map = maps.map;
var obstacle_map = maps.obstacle_map;
var mapCols = map[1].length; // level width, in tiles
var mapRows = map.length; // level height, in tiles
var tileSize = 32; // tile size, in pixels

setPokemon(map, obstacle_map, 2, 2, 2, true);

///////////////////
/* Canvas Setup */
/////////////////

var bgcanvas = document.getElementById("bgcanvas"); // the bgcanvas where game will be drawn
var bgcontext = bgcanvas.getContext("2d"); // bgcanvas context
var canvas = document.getElementById("canvas"); // the canvas where game will be drawn
var context = canvas.getContext("2d"); // canvas context
var touchcanvas = document.getElementById("touchcanvas"); // the touch canvas where joystick will be drawn
var touchcontext = touchcanvas.getContext("2d"); // touch canvas context

var screenWidth = window.innerWidth || screen.width; // screen width
var screenHeight = window.innerHeight || screen.height; // screen height
canvas.width = tileSize * mapCols; // canvas width
canvas.height = tileSize * mapRows; // canvas height
bgcanvas.width = screenWidth; // bgcanvas width
bgcanvas.height = screenHeight; // bgcanvas height
touchcanvas.width = screenWidth; // touchcanvas width
touchcanvas.height = screenHeight; // touchcanvas height

disableScrolling("bgcanvas");
disableScrolling("canvas");
disableScrolling("touchcanvas");

///////////////////
/* Camera Setup */
/////////////////
var camX = 0;
var camY = 0;

var camWidth = Math.round(screenWidth / tileSize) * tileSize; // camera width
var camHeight = Math.round(screenHeight / tileSize) * tileSize; // camera height

///////////////////
/* Player setup */
/////////////////

var playerCol = Math.round(camWidth / (2 * tileSize)); // player starting column
var playerRow = Math.round(camHeight / (2 * tileSize)); // player starting row

if (canvas.width < screenWidth) {
	playerCol = Math.round(mapCols / 2);
}
if (canvas.height < screenHeight) {
	playerRow = Math.round(mapRows / 2);
}

var playerYPos = playerRow * tileSize; // player Y position in pixels
var playerXPos = playerCol * tileSize; // player X position in pixels

//////////////////
/* Load images */
////////////////

var grassTiles = new Image();
grassTiles.src = "images/grass.png";

var waterTiles = new Image();
waterTiles.src = "images/water.png";

var charTiles = new Image();
charTiles.src = "images/male_walkcycle.png";

/////////////////////////////
/* Pokemon database setup */
///////////////////////////

loadPokemonDatabase();
var pokemonDatabase = []; // Collection of all Pokemon data stores as database
function loadPokemonDatabase() {
	var pokemonData = []; // Individual Pokemon data
	var pokemonTiles = []; // Individual Pokemon sprite collection

	var pokeCanvas = document.createElement('canvas');
	var pokeContext = pokeCanvas.getContext('2d');
	pokeCanvas.height = tileSize;
	pokeCanvas.width = tileSize;
	var pokemonTileSet = new Image();
	pokemonTileSet.onload = function () {
		for (var i = 1; i < pokemon_data.length; i++) {
			pokemonData = []; // Reset as we are obtaining data for a new Pokemon
			pokemonTiles = [];
			var pokemon = pokemon_data[i];
			pokemonData.generation = parseInt(pokemon.A);
			pokemonData.id = parseInt(pokemon.B);
			pokemonData.name = pokemon.C;
			pokemonData.primaryType = pokemon.D;
			pokemonData.secondaryType = pokemon.E;
			pokemonData.evolutionLevel = parseInt(pokemon.F);
			for (var j = 0; j < 3; j++) {
				for (var k = 0; k < 2; k++) {
					var xPos = parseInt(pokemon.H);
					var yPos = parseInt(pokemon.I);
					var size = parseInt(pokemon.J);
					pokeContext.drawImage(
						pokemonTileSet,
						xPos + (k * size),
						yPos + (j * size),
						size,
						size,
						0,
						0,
						tileSize,
						tileSize);
					pokemonTiles.push(cloneCanvas(pokeCanvas));
					pokeContext.clearRect(0, 0, pokeCanvas.width, pokeCanvas.height);
				}
			}
			pokemonData.sprites = pokemonTiles;
			pokemonDatabase[i] = pokemonData;
		}
		loading = false;
	}
	pokemonTileSet.src = 'images/pokemon_overworld.png';
}

///////////////////////
/* Helper functions */
/////////////////////

function cloneCanvas(oldCanvas) {
	//create a new canvas
	var newCanvas = document.createElement('canvas');
	var context = newCanvas.getContext('2d');
	//set dimensions
	newCanvas.width = oldCanvas.width;
	newCanvas.height = oldCanvas.height;
	//apply the old canvas to the new one
	context.drawImage(oldCanvas, 0, 0);
	//return the new canvas
	return newCanvas;
}

function disableScrolling(scrollCanvas) {
	document.getElementById(scrollCanvas).onwheel = function (event) {
		event.preventDefault();
	};
	document.getElementById(scrollCanvas).onmousewheel = function (event) {
		event.preventDefault();
	};
}