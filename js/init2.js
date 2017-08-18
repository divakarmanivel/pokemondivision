var canvas = document.getElementById("canvas");   
// the canvas where game will be drawn
var context = canvas.getContext("2d");            
// canvas context
var touchcanvas = document.getElementById("touchcanvas");   
// the touch canvas where joystick will be drawn
var touchcontext = touchcanvas.getContext("2d");    
// touch canvas context

var level = initMap(200,200);

var levelCols=level[1].length;					
// level width, in tiles
var levelRows=level.length;	
// level height, in tiles
var tileSize=32;
// tile size, in pixels

var screenWidth=window.innerWidth||screen.width;
var screenHeight=window.innerHeight||screen.height;
canvas.width=tileSize*levelCols;               
 // canvas width
canvas.height=tileSize*levelRows;               
// canvas height
touchcanvas.width=screenWidth;
// touchcanvas width
touchcanvas.height=screenHeight;
// touchcanvas height

var difX=0;
var difY=0;
var sX=0;
var sY=0;

var camX=0;
var camY=0;

var camWidth=Math.round(screenWidth/tileSize)*tileSize;
var camHeight=Math.round(screenHeight/tileSize)*tileSize;
// camera position

var playerCol=Math.round(camWidth/(2*tileSize));
// player starting column
var playerRow=Math.round(camHeight/(2*tileSize));
// player starting row

if(canvas.width<screenWidth){playerCol=Math.round(levelCols/2);}
if(canvas.height<screenHeight){playerRow=Math.round(levelRows/2);}

var playerYPos=playerRow*tileSize;
var playerXPos=playerCol*tileSize;
// converting player position from tiles to pixels

//Loader.loadImage('tiles','../img/map1.png');
//var mapTiles=Loader.getImage('tiles');
var grassTiles = new Image();
grassTiles.src="images/grass.png";


var waterTiles = new Image();
waterTiles.src="images/water.png";


var charTiles = new Image();
charTiles.src="images/male_walkcycle.png";

var pokemonTiles=[];
var pokemon = [];
var pokemons = new Image();
pokemons.onload=function(){
for (var i = 0; i < 176; i++){
  for (var j = 0; j < 16; j++){
	pokemon = [];
	for(var k = 0; k < 2; k++){
	var pokeCanvas = document.createElement('canvas');
 	var pokeContext = pokeCanvas.getContext('2d');
	pokeContext.drawImage(
		pokemons, 
		(j+k)*tileSize,
		i*tileSize,
		tileSize, 
		tileSize,
		0,
		0,
		tileSize,
		tileSize);
    	pokemon.push(pokeCanvas);
	}
	pokemonTiles.push(pokemon);
    }
  }
}

pokemons.src = 'images/pokemon_overworld.png';

/*
function createImage(src, title) {
  var img   = new Image();
  img.src   = src;
  img.alt   = title;
  img.title = title;
  return img; 
}
*/