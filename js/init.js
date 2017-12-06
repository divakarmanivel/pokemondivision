///////////////////
/* Global Setup */
/////////////////

var loading = true;
var loadingNPC = true;
var loadingPokemon = true;

// global variables to calculate movement
var difX = 0;
var difY = 0;
var sX = 0;
var sY = 0;
var movement = false;
var btn_a;
var btn_b;
var btn_start;
var btn_select;

//////////////////
/* Level Setup */
////////////////

var maps = initMap(1, 100, 100);
var path_map = maps.path_map;
var obstacle_map = maps.obstacle_map;
var npc_map = maps.npc_map;
var pokemon_map = maps.pokemon_map;
var mapCols = path_map[1].length; // level width, in tiles
var mapRows = path_map.length; // level height, in tiles
var tileSize = 32; // tile size, in pixels
setBorders();
setMovingPokemon(2, 2, 2);
setMovingPokemon(18, 5, 30);
setRotatingPokemon(2, 10, 16);
setRotatingPokemon(15, 14, 8);
setMovingNPC(4, 6, 2000);
setMovingNPC(6, 9, 2000);
setRotatingNPC(14, 2, 2000);
setRotatingNPC(9, 6, 2000);

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

var controls_inner = new Image();
controls_inner.src = "images/controls_inner.png";

var controls_outer = new Image();
controls_outer.src = "images/controls_outer.png";

var controls_a = new Image();
controls_a.src = "images/controls_a.png";

var controls_b = new Image();
controls_b.src = "images/controls_b.png";

var controls_start = new Image();
controls_start.src = "images/controls_start.png";

var controls_select = new Image();
controls_select.src = "images/controls_select.png";

var outdoorTiles = new Image();
outdoorTiles.src = "images/outdoor.png";

var charTiles = new Image();
charTiles.src = "images/hero_overworld.png";

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
	pokemonTileSet.onload = function() {
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
			pokemonTiles.push(flipCanvas(pokemonTiles[5]));
			pokemonTiles.push(flipCanvas(pokemonTiles[4]));
			pokemonData.sprites = pokemonTiles;
			pokemonDatabase[i] = pokemonData;
		}
		loadingPokemon = false;
		checkRender();
	}
	pokemonTileSet.src = 'images/pokemon_overworld.png';
}

/////////////////////////////
/* NPC database setup */
///////////////////////////

loadNPCDatabase();
var NPCDatabase = []; // Collection of all NPC data stores as database
function loadNPCDatabase() {
	var NPCData = []; // Individual NPC data
	var NPCTiles = []; // Individual NPC sprite collection

	var NPCCanvas = document.createElement('canvas');
	var NPCContext = NPCCanvas.getContext('2d');
	NPCCanvas.height = tileSize;
	NPCCanvas.width = tileSize;
	var NPCTileSet = new Image();
	NPCTileSet.onload = function() {
		for (var i = 0; i < 1; i++) {
			NPCData = []; // Reset as we are obtaining data for a new NPC
			NPCTiles = [];
			/*
			var NPC = NPC_data[i];
			NPCData.generation = parseInt(NPC.A);
			NPCData.id = parseInt(NPC.B);
			NPCData.name = NPC.C;
			NPCData.primaryType = NPC.D;
			NPCData.secondaryType = NPC.E;
			NPCData.evolutionLevel = parseInt(NPC.F);
			*/
			for (var j = 0; j < 3; j++) {
				for (var k = 0; k < 2; k++) {
					var xPos = 0;
					var yPos = 0;
					var size = 32;
					NPCContext.drawImage(
						NPCTileSet,
						xPos + (k * size),
						yPos + (j * size),
						size,
						size,
						0,
						0,
						tileSize,
						tileSize);
					NPCTiles.push(cloneCanvas(NPCCanvas));
					NPCContext.clearRect(0, 0, NPCCanvas.width, NPCCanvas.height);
				}
			}
			NPCTiles.push(flipCanvas(NPCTiles[5]));
			NPCTiles.push(flipCanvas(NPCTiles[4]));
			NPCData.sprites = NPCTiles;
			NPCDatabase[i] = NPCData;
		}
		loadingNPC = false;
		checkRender();
	}
	NPCTileSet.src = 'images/npc_overworld.png';
}

///////////////////////
/* Helper functions */
/////////////////////

function checkRender() {
	if (loadingPokemon == false && loadingNPC == false) {
		loading = false;
	}
}

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

function flipCanvas(oldCanvas) {
	//create a new canvas
	var newCanvas = document.createElement('canvas');
	var context = newCanvas.getContext('2d');
	//set dimensions
	newCanvas.width = oldCanvas.width;
	newCanvas.height = oldCanvas.height;
	//flip canvas
	context.translate(newCanvas.width, 0);
	context.scale(-1, 1);
	//apply the old canvas to the new one
	context.drawImage(oldCanvas, 0, 0);
	//return the new canvas
	return newCanvas;
}

function disableScrolling(scrollCanvas) {
	document.getElementById(scrollCanvas).onwheel = function(event) {
		event.preventDefault();
	};
	document.getElementById(scrollCanvas).onmousewheel = function(event) {
		event.preventDefault();
	};
}