var loading = true;

var canvas = document.getElementById("canvas"); // the canvas where game will be drawn
var context = canvas.getContext("2d"); // canvas context
var touchcanvas = document.getElementById("touchcanvas"); // the touch canvas where joystick will be drawn
var touchcontext = touchcanvas.getContext("2d"); // touch canvas context

///////////////////
/* Level Setup */
/////////////////

var level = initMap(200,200);

var levelCols=level[1].length; // level width, in tiles
var levelRows=level.length; // level height, in tiles
var tileSize=32; // tile size, in pixels

setMap(level, 2, 2, 2);

///////////////////
/* Canvas Setup */
/////////////////

var screenWidth=window.innerWidth||screen.width;
var screenHeight=window.innerHeight||screen.height;
canvas.width=tileSize*levelCols; // canvas width
canvas.height=tileSize*levelRows; // canvas height
touchcanvas.width=screenWidth; // touchcanvas width
touchcanvas.height=screenHeight; // touchcanvas height

// variables to calculate movement
var difX=0;
var difY=0;
var sX=0;
var sY=0;

///////////////////
/* Camera Setup */
/////////////////
var camX=0;
var camY=0;

var camWidth=Math.round(screenWidth/tileSize)*tileSize; // camera width
var camHeight=Math.round(screenHeight/tileSize)*tileSize; // camera height

///////////////////
/* Player Setup */
/////////////////

var playerCol=Math.round(camWidth/(2*tileSize)); // player starting column
var playerRow=Math.round(camHeight/(2*tileSize)); // player starting row

if(canvas.width<screenWidth){playerCol=Math.round(levelCols/2);}
if(canvas.height<screenHeight){playerRow=Math.round(levelRows/2);}

var playerYPos=playerRow*tileSize; // player Y position in pixels
var playerXPos=playerCol*tileSize; // player X position in pixels

///////////////////
/* Load images */
/////////////////

//Loader.loadImage('tiles','../img/map1.png');
//var mapTiles=Loader.getImage('tiles');
var grassTiles = new Image();
grassTiles.src="images/grass.png";

var waterTiles = new Image();
waterTiles.src="images/water.png";

var charTiles = new Image();
charTiles.src="images/male_walkcycle.png";

/////////////////////////////////////////
/* Pokemon database setup begins here */
///////////////////////////////////////
var pokemon_data; // This will hold all the pokemon data in json format

function loadJSON(file,callback){
var xhr = new XMLHttpRequest();
xhr.overrideMimeType("application/json");
xhr.open("GET",file,true);
xhr.onreadystatechange = function(){
	if(xhr.readyState==4&&xhr.status=="200"){
		callback(xhr.responseText);
	}
}
xhr.send(null);
}

loadJSON("pokemon_db/pokemon_json.json", function(response){
		pokemon_data = JSON.parse(response);
		loadPokemonDatabase();
});

var pokemonDatabase=[]; // Collection of all Pokemon data stores as database
function loadPokemonDatabase(){
	var pokemonData=[]; // Individual Pokemon data
	var pokemonTiles=[]; // Individual Pokemon sprite collection

	var pokeCanvas = document.createElement('canvas');
	var pokeContext = pokeCanvas.getContext('2d');
  pokeCanvas.height=tileSize;
  pokeCanvas.width=tileSize;
	var pokemonTileSet = new Image();
	pokemonTileSet.onload=function(){
	for (var i = 1; i < pokemon_data.length; i++){
		pokemonData=[]; // Reset as we are obtaining data for a new Pokemon
    pokemonTiles=[];
		var pokemon=pokemon_data[i];
		pokemonData.generation=parseInt(pokemon.A);
		pokemonData.id=parseInt(pokemon.B);
		pokemonData.name=pokemon.C;
		pokemonData.primaryType=pokemon.D;
		pokemonData.secondaryType=pokemon.E;
		pokemonData.evolutionLevel=parseInt(pokemon.F);
    for (var j = 0; j < 3; j++){
		for (var k = 0; k < 2; k++){
			var xPos = parseInt(pokemon.H);
			var yPos = parseInt(pokemon.I);
			var size = parseInt(pokemon.J);
			pokeContext.drawImage(
				pokemonTileSet, 
				xPos+(k*size),
				yPos+(j*size),
				size, 
				size,
				0,
				0,
				tileSize,
				tileSize);
		  pokemonTiles.push(cloneCanvas(pokeCanvas));
      pokeContext.clearRect(0,0,pokeCanvas.width,pokeCanvas.height);
  	}}
		pokemonData.sprites=pokemonTiles;
		pokemonDatabase[i]=pokemonData;
	}
loading = false;
}
pokemonTileSet.src = 'images/pokemon_overworld.png';
}

function cloneCanvas(oldCanvas) {
    //create a new canvas
    var newCanvas = document.createElement('canvas');
    var newContext = newCanvas.getContext('2d');
    //set dimensions
    newCanvas.width = oldCanvas.width;
    newCanvas.height = oldCanvas.height;
    newContext.clearRect(0,0,newCanvas.width,newCanvas.height);
    //apply the old canvas to the new one
    newContext.drawImage(oldCanvas, 0, 0);
    //return the new canvas
    return newCanvas;
}
